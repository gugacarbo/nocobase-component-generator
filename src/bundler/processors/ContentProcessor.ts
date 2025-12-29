import { StringUtils } from "@common/utils";
import { FileInfo } from "../core/types";
import { TypeScriptRemover } from "./TypeScriptRemover";
import { NocoBaseAdapter } from "../adapters/NocoBaseAdapter";
import { RegexPatterns } from "../utils/RegexPatterns";

/**
 * Responsável por processar e limpar conteúdo de arquivos
 */
export class ContentProcessor {
	/**
	 * Obtém o conteúdo de todos os arquivos da lista
	 */
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

	/**
	 * Determina o nome do arquivo de saída baseado no componente principal
	 */
	public static getOutputFileName(mainComponent: string | null): string {
		return mainComponent
			? StringUtils.toKebabCase(mainComponent)
			: "bundled-component";
	}

	/**
	 * Remove imports, exports e opcionalmente tipos
	 */
	public static cleanContent(
		content: string,
		fileName: string,
		removeTypes: boolean = false,
	): string {
		let cleaned = content;

		// Remove todos os imports usando regex centralizada
		cleaned = cleaned.replace(RegexPatterns.IMPORT_STATEMENT, "");

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
	 * Remove todas as declarações de export
	 */
	private static removeExports(content: string): string {
		let cleaned = content;

		// Remove export default + identificador
		cleaned = cleaned.replace(RegexPatterns.EXPORT_DEFAULT, "");

		// Remove export default inline
		cleaned = cleaned.replace(RegexPatterns.EXPORT_INLINE, "");

		// Remove export named
		cleaned = cleaned.replace(RegexPatterns.EXPORT_NAMED, "");

		// Remove export { ... }
		cleaned = cleaned.replace(RegexPatterns.EXPORT_BLOCK, "");

		return cleaned;
	}

	/**
	 * Concatena múltiplos arquivos, ignorando arquivos de teste
	 */
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
	 * Gera export para componente (JavaScript ou TypeScript)
	 */
	public static generateExport(
		component: string,
		isJavaScript: boolean,
	): string {
		return isJavaScript
			? NocoBaseAdapter.generateRender(component)
			: NocoBaseAdapter.generateExport(component);
	}
}
