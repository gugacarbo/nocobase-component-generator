import * as fs from "fs";
import { PathUtils } from "@/common/utils/PathUtils";
import { Logger } from "@/common/Logger";
import { FileInfo, FileLoadContext } from "../core/types";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { FileValidator } from "../utils/FileValidator";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";

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
					if (!FileValidator.shouldExcludeDir(filePath)) {
						this.findFiles(filePath, fileList);
					}
				} else if (FileValidator.isSupportedFile(file)) {
					if (!FileValidator.shouldExcludeFile(file)) {
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
	 * Carrega informações de um arquivo
	 */
	public static loadFileInfo(filePath: string, srcDir: string): FileInfo {
		try {
			const content = fs.readFileSync(filePath, "utf-8");

			if (!content || content.trim() === "") {
				Logger.warning(`Arquivo vazio ignorado: ${filePath}`);
			}

			const imports = ImportAnalyzer.extractPaths(content);
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

		const importsWithNames = ImportAnalyzer.extractWithNames(fileInfo.content);

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
}
