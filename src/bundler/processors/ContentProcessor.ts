import { StringUtils } from "@common/utils";
import { FileInfo } from "../core/types";
import { TypeScriptRemover } from "./TypeScriptRemover";
import { RegexPatterns } from "../utils/RegexPatterns";
import { ExportProcessor } from "./ExportProcessor";
import { FileValidator } from "../utils/FileValidator";

/**
 * Responsável por processar e limpar conteúdo de arquivos
 */
export class ContentProcessor {
	public static getOutputFileName(mainComponent: string | null): string {
		return mainComponent
			? StringUtils.toKebabCase(mainComponent)
			: "bundled-component";
	}

	public static cleanContent(
		content: string,
		fileName: string,
		removeTypes: boolean = false,
	): string {
		let cleaned = content;

		cleaned = cleaned.replace(RegexPatterns.IMPORT_STATEMENT, "");
		cleaned = ExportProcessor.removeExports(cleaned);

		if (removeTypes) {
			cleaned = TypeScriptRemover.removeTypes(cleaned, fileName);
		}

		cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n");

		return cleaned.trim();
	}

	public static concatenateFiles(
		sortedFiles: string[],
		fileInfoMap: Map<string, FileInfo>,
		isJavascript: boolean,
	): string {
		const contents: string[] = [];
		for (const filePath of sortedFiles) {
			const fileInfo = fileInfoMap.get(filePath);
			if (!fileInfo || FileValidator.isMockOrTestFile(fileInfo.relativePath)) {
				continue;
			}

			let cleanedContent = this.cleanContent(
				fileInfo.content,
				fileInfo.relativePath,
				isJavascript,
			);

			contents.push(cleanedContent);
		}

		return contents.join("\n\n");
	}
}
