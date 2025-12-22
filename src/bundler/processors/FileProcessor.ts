import * as fs from "fs";
import { BundlerConfig } from "../config/BundlerConfig";
import { PathUtils } from "../utils/PathUtils";
import { Logger } from "../utils/Logger";
import { TypeScriptRemover } from "../transformers/TypeScriptRemover";
import { FileInfo } from "../core/types";

/**
 * Processador de arquivos individuais
 */
export class FileProcessor {
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

			files.forEach((file) => {
				const filePath = PathUtils.join(dir, file);
				const stat = fs.statSync(filePath);

				if (stat.isDirectory()) {
					// Pula diretórios excluídos
					if (!BundlerConfig.shouldExcludeDir(filePath)) {
						this.findFiles(filePath, fileList);
					}
				} else if (BundlerConfig.isSupportedFile(file)) {
					// Pula arquivos excluídos
					if (!BundlerConfig.shouldExcludeFile(file)) {
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

	/**
	 * Remove imports, exports e opcionalmente tipos
	 */
	public static cleanContent(
		content: string,
		fileName: string,
		removeTypes: boolean = false
	): string {
		let cleaned = content;

		// Remove todos os imports
		cleaned = this.removeImports(cleaned);

		// Remove exports
		cleaned = this.removeExports(cleaned);

		// Remove TypeScript se solicitado
		if (removeTypes) {
			cleaned = TypeScriptRemover.removeTypes(cleaned, fileName);
		}

		// Normaliza quebras de linha
		cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

		return cleaned.trim();
	}

	/**
	 * Remove todas as declarações de import
	 */
	private static removeImports(content: string): string {
		return content.replace(
			/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?\n?/g,
			""
		);
	}

	/**
	 * Remove todas as declarações de export
	 */
	private static removeExports(content: string): string {
		let cleaned = content;

		// Remove export default + identificador
		cleaned = cleaned.replace(/^\s*export\s+default\s+\w+\s*;?\s*$/gm, "");

		// Remove export default inline
		cleaned = cleaned.replace(/export\s+default\s+/g, "");

		// Remove export named
		cleaned = cleaned.replace(
			/export\s+(?=const|let|var|function|class|interface|type|enum)/g,
			""
		);

		// Remove export { ... }
		cleaned = cleaned.replace(/export\s*\{[^}]*\}\s*;?\n?/g, "");

		return cleaned;
	}

	/**
	 * Carrega informações de um arquivo
	 */
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

	/**
	 * Cria um diretório recursivamente
	 */
	public static ensureDirectory(dirPath: string): void {
		if (!this.directoryExists(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
	}

	/**
	 * Lê um arquivo com tratamento de erros
	 */
	public static readFile(filePath: string): string | null {
		try {
			return fs.readFileSync(filePath, "utf-8");
		} catch (error) {
			Logger.error(`Erro ao ler arquivo ${filePath}`, error as Error);
			return null;
		}
	}

	/**
	 * Escreve um arquivo com tratamento de erros
	 */
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
}
