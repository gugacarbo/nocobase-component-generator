import * as fs from "fs";
import { PathUtils } from "@/common/utils/PathUtils";
import { Logger } from "@/common/Logger";
import { FileInfo, FileLoadContext } from "../core/types";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { FileValidator } from "../utils/FileValidator";
import { ImportExtractor } from "../analyzers/ImportExtractor";

/**
 * Responsável por carregar arquivos e diretórios
 */
export class FileLoader {
	/**
	 * Encontra todos os arquivos suportados recursivamente
	 */
	public static findFiles(dir: string, fileList: string[] = []): string[] {
		try {
			if (!fs.existsSync(dir)) {
				Logger.warning(`Diretório não encontrado: ${dir}`);
				return fileList;
			}

			const files = fs.readdirSync(dir);

			files.forEach(file => {
				const filePath = PathUtils.join(dir, file);
				const stat = fs.statSync(filePath);

				if (stat.isDirectory()) {
					if (!this.shouldExcludeDir(filePath)) {
						this.findFiles(filePath, fileList);
					}
				} else if (this.isSupportedFile(file)) {
					if (!this.shouldExcludeFile(file)) {
						fileList.push(filePath);
					}
				}
			});

			return fileList;
		} catch (error) {
			Logger.error(`Erro ao buscar arquivos em ${dir}`, error as Error);
			return fileList;
		}
	}

	/**
	 * Extrai imports de um arquivo
	 */
	public static extractImports(content: string): string[] {
		return ImportExtractor.extractPaths(content);
	}

	/**
	 * Extrai imports com seus nomes importados
	 * Retorna um mapa: caminho do import -> lista de nomes importados
	 * @deprecated Use ImportExtractor.extractWithNames() ao invés
	 */
	public static extractImportsWithNames(
		content: string,
	): Map<string, string[]> {
		return ImportExtractor.extractWithNames(content);
	}

	/**
	 * Carrega informações de um arquivo
	 */
	public static loadFileInfo(filePath: string, srcDir: string): FileInfo {
		try {
			const content = fs.readFileSync(filePath, "utf-8");

			if (!content || content.trim() === "") {
				Logger.warning(`Arquivo vazio ignorado: ${filePath}`);
			}

			const imports = this.extractImports(content);
			const relativePath = PathUtils.getRelativePath(srcDir, filePath);

			return {
				path: filePath,
				content,
				imports,
				relativePath,
			};
		} catch (error) {
			Logger.error(`Erro ao carregar arquivo ${filePath}`, error as Error);
			throw error;
		}
	}

	/**
	 * Carrega todos os arquivos de um diretório
	 */
	public static loadDirectory(srcPath: string): FileLoadContext {
		const files = new Map<string, FileInfo>();
		const allFiles = this.findFiles(srcPath);
		let firstFileRelativePath = "";

		allFiles.forEach((filePath, index) => {
			const fileInfo = this.loadFileInfo(filePath, srcPath);
			files.set(filePath, fileInfo);

			if (index === 0) {
				firstFileRelativePath = fileInfo.relativePath;
			}
		});

		return { files, firstFileRelativePath };
	}

	/**
	 * Carrega um arquivo único e suas dependências recursivamente
	 */
	public static loadSingleFile(filePath: string): FileLoadContext {
		const files = new Map<string, FileInfo>();
		const baseDir = PathUtils.dirname(filePath);

		this.loadFileWithDependencies(filePath, baseDir, files);

		const fileInfo = files.get(filePath);
		const firstFileRelativePath = fileInfo ? fileInfo.relativePath : "";
		return { files, firstFileRelativePath };
	}

	/**
	 * Carrega um arquivo e suas dependências recursivamente (helper privado)
	 * Resolve re-exports de barrel files (index.ts) automaticamente
	 */
	private static loadFileWithDependencies(
		filePath: string,
		baseDir: string,
		filesMap: Map<string, FileInfo>,
	): void {
		if (filesMap.has(filePath)) {
			return;
		}

		const fileInfo = this.loadFileInfo(filePath, baseDir);
		filesMap.set(filePath, fileInfo);

		const importsWithNames = ImportExtractor.extractWithNames(fileInfo.content);

		importsWithNames.forEach((importedNames, importPath) => {
			const resolvedFiles = DependencyResolver.resolveImportWithReExports(
				filePath,
				importPath,
				importedNames,
			);

			resolvedFiles.forEach(resolvedPath => {
				if (resolvedPath && fs.existsSync(resolvedPath)) {
					this.loadFileWithDependencies(resolvedPath, baseDir, filesMap);
				}
			});
		});
	}

	/**
	 * Valida se um arquivo existe
	 */
	public static fileExists(filePath: string): boolean {
		try {
			return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
		} catch {
			return false;
		}
	}

	/**
	 * Valida se um diretório existe
	 */
	public static directoryExists(dirPath: string): boolean {
		try {
			return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
		} catch {
			return false;
		}
	}

	private static shouldExcludeFile(fileName: string): boolean {
		return FileValidator.shouldExcludeFile(fileName);
	}

	private static shouldExcludeDir(dirPath: string): boolean {
		return FileValidator.shouldExcludeDir(dirPath);
	}

	private static isSupportedFile(fileName: string): boolean {
		return FileValidator.isSupportedFile(fileName);
	}
}
