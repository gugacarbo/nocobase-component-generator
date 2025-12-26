import * as fs from "fs";
import { PathUtils } from "../../common/utils/PathUtils";
import { Logger } from "../../common/Logger";
import { TypeScriptRemover } from "./TypeScriptRemover";
import { BundleResult, FileInfo } from "../core/types";
import { NocoBaseAdapter } from "../adapters/NocoBaseAdapter";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { StringUtils } from "@/common/utils";
import { CodeFormatter } from "./CodeFormatter";
import { APP_CONFIG } from "@/config/config";

/**
 * Processador de arquivos individuais
 */
export class FileProcessor {
	// [ Obtém o conteúdo de todos os arquivos da lista ]
	public static getFileContents(
		files: Map<string, FileInfo>,
		sortedFiles: string[],
	): Map<string, string> {
		const contents = new Map<string, string>();
		sortedFiles.forEach(filePath => {
			const fileInfo = files.get(filePath);
			if (fileInfo) {
				contents.set(filePath, fileInfo.content);
			}
		});
		return contents;
	}

	// [ Determina o nome do arquivo de saída baseado no componente principal ]
	public static getOutputFileName(mainComponent: string | null): string {
		return mainComponent
			? StringUtils.toKebabCase(mainComponent)
			: "bundled-component";
	}

	// [ Remove imports, exports e opcionalmente tipos ]
	public static cleanContent(
		content: string,
		fileName: string,
		removeTypes: boolean = false,
	): string {
		let cleaned = content;

		//| Remove todos os imports
		cleaned = this.removeImports(cleaned);

		//| Remove exports
		cleaned = this.removeExports(cleaned);

		//| Remove TypeScript se solicitado
		if (removeTypes) {
			cleaned = TypeScriptRemover.removeTypes(cleaned, fileName);
		}

		//| Normaliza quebras de linha
		cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

		return cleaned.trim();
	}

	// [ Remove todas as declarações de import ]
	private static removeImports(content: string): string {
		return content.replace(
			/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?\n?/g,
			"",
		);
	}

	// [ Remove todas as declarações de export ]
	private static removeExports(content: string): string {
		let cleaned = content;

		// Remove export default + identificador
		cleaned = cleaned.replace(/^\s*export\s+default\s+\w+\s*;?\s*$/gm, "");

		// Remove export default inline
		cleaned = cleaned.replace(/export\s+default\s+/g, "");

		// Remove export named
		cleaned = cleaned.replace(
			/export\s+(?=const|let|var|function|class|interface|type|enum)/g,
			"",
		);

		// Remove export { ... }
		cleaned = cleaned.replace(/export\s*\{[^}]*\}\s*;?\n?/g, "");

		return cleaned;
	}

	// Encontra todos os arquivos suportados recursivamente
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
					// Pula diretórios excluídos
					if (!this.shouldExcludeDir(filePath)) {
						this.findFiles(filePath, fileList);
					}
				} else if (this.isSupportedFile(file)) {
					// Pula arquivos excluídos
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

	// Extrai imports de um arquivo
	public static extractImports(content: string): string[] {
		const imports: string[] = [];
		const importRegex =
			/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;

		let match;
		while ((match = importRegex.exec(content)) !== null) {
			const importPath = match[1];
			// Só inclui imports relativos
			if (PathUtils.isRelativePath(importPath)) {
				imports.push(importPath);
			}
		}
		return imports;
	}

	// Carrega informações de um arquivo
	public static loadFileInfo(filePath: string, srcDir: string): FileInfo {
		try {
			const content = fs.readFileSync(filePath, "utf-8");
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

	// Carrega todos os arquivos de um diretório

	public static loadDirectory(srcPath: string): {
		files: Map<string, FileInfo>;
		firstFileRelativePath: string;
	} {
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

	// Carrega um arquivo único e suas dependências recursivamente

	public static loadSingleFile(filePath: string): {
		files: Map<string, FileInfo>;
		firstFileRelativePath: string;
	} {
		const files = new Map<string, FileInfo>();
		const baseDir = PathUtils.dirname(filePath);

		// Carrega arquivo principal e dependências
		this.loadFileWithDependencies(filePath, baseDir, files);

		// Obtém o caminho relativo do arquivo principal
		const fileInfo = files.get(filePath);
		const firstFileRelativePath = fileInfo ? fileInfo.relativePath : "";
		return { files, firstFileRelativePath };
	}

	// Carrega um arquivo e suas dependências recursivamente (helper privado)
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

		fileInfo.imports.forEach(importPath => {
			const resolvedPath = DependencyResolver.resolveImportPath(
				filePath,
				importPath,
			);

			if (resolvedPath && fs.existsSync(resolvedPath)) {
				this.loadFileWithDependencies(resolvedPath, baseDir, filesMap);
			}
		});
	}

	// Valida se um arquivo existe
	public static fileExists(filePath: string): boolean {
		try {
			return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
		} catch {
			return false;
		}
	}

	// Valida se um diretório existe
	public static directoryExists(dirPath: string): boolean {
		try {
			return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
		} catch {
			return false;
		}
	}

	// Cria um diretório recursivamente
	public static ensureDirectory(dirPath: string): void {
		if (!this.directoryExists(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
	}

	// Escreve um arquivo com tratamento de erros
	public static writeFile(filePath: string, content: string): boolean {
		try {
			this.ensureDirectory(PathUtils.dirname(filePath));
			fs.writeFileSync(filePath, content, "utf-8");
			return true;
		} catch (error) {
			Logger.error(`Erro ao escrever arquivo ${filePath}`, error as Error);
			return false;
		}
	}

	// Concatena múltiplos arquivos, ignorando arquivos de teste
	public static concatenateFiles(
		sortedFiles: string[],
		fileInfoMap: Map<string, FileInfo>,
		isJavascript: boolean,
	): string {
		const contents: string[] = [];
		for (const filePath of sortedFiles) {
			const fileInfo = fileInfoMap.get(filePath);
			if (
				!fileInfo ||
				NocoBaseAdapter.shouldIgnoreFile(fileInfo.relativePath)
			) {
				continue;
			}

			const cleanedContent = this.cleanContent(
				fileInfo.content,
				fileInfo.relativePath,
				isJavascript,
			);

			contents.push(cleanedContent);
		}

		return contents.join("\n\n");
	}

	/**
	 * Salva o bundle formatado no disco
	 */
	public static async saveBundle(
		result: BundleResult,
		fileName: string,
		outputDir: string,
		firstFileRelativePath: string,
	): Promise<void> {
		const outputPath = this.getOutputPath(
			outputDir,
			firstFileRelativePath,
			fileName,
		);

		const isTypeScript = fileName.endsWith(".tsx");
		const formattedContent = await CodeFormatter.format(
			result.content,
			isTypeScript,
		);

		FileProcessor.ensureDirectory(PathUtils.dirname(outputPath));
		FileProcessor.writeFile(outputPath, formattedContent);

		Logger.file(`${fileName} salvo: ${outputPath}`);
	}

	/**
	 * Calcula o caminho de saída completo
	 */
	private static getOutputPath(
		outputDir: string,
		firstFileRelativePath: string,
		fileName: string,
	): string {
		const firstFileDir = PathUtils.dirname(firstFileRelativePath);
		const outputSubDir = PathUtils.join(outputDir, firstFileDir);
		return PathUtils.join(outputSubDir, fileName);
	}

	public static generateExport(
		component: string,
		isJavaScript: boolean,
	): string {
		return isJavaScript
			? NocoBaseAdapter.generateRender(component)
			: NocoBaseAdapter.generateExport(component);
	}
	private static shouldExcludeFile(fileName: string): boolean {
		return APP_CONFIG.bundler.EXCLUDED_FILES.some(excluded =>
			fileName.includes(excluded),
		);
	}

	private static shouldExcludeDir(dirPath: string): boolean {
		return APP_CONFIG.bundler.EXCLUDED_DIRS.some(excluded =>
			dirPath.includes(excluded),
		);
	}

	private static isSupportedFile(fileName: string): boolean {
		return APP_CONFIG.bundler.FILE_EXTENSIONS.test(fileName);
	}
}
