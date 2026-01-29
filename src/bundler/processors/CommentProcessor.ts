import { APP_CONFIG } from "@/config/config";

/**
 * Responsável por processar comentários especiais do bundler
 */
export class CommentProcessor {
	/**
	 * Processa comentários especiais (//bundle-only e //no-bundle)
	 */
	public static processComments(content: string): string {
		// Remove linhas marcadas com //no-bundle antes de qualquer outro processamento
		content = this.removeNoBundleLines(content);
		const lines = content.split("\n");
		const processedLines: string[] = [];
		let inMultilineComment = false;

		for (const line of lines) {
			// Detecta início/fim de comentário multilinha
			if (line.includes("/*")) {
				inMultilineComment = true;
			}

			// Pula linhas dentro de comentário multilinha
			if (inMultilineComment) {
				if (line.includes("*/")) {
					inMultilineComment = false;
				}
				continue;
			}

			// Processa linha com bundle-only
			const bundleOnlyMatch = line.match(
				APP_CONFIG.bundler.BUNDLE_ONLY_PATTERN,
			);

			if (bundleOnlyMatch) {
				const indent = line.match(/^(\s*)/)?.[1] || "";
				processedLines.push(indent + bundleOnlyMatch[1]);
				continue;
			}

			// Remove comentários inline (mas preserva URLs como http://)
			let processedLine = line.replace(/([^:])\/\/.*$/, "$1").trimEnd();

			// Adiciona linha se não estiver vazia ou se for quebra intencional
			if (processedLine.trim() !== "" || line.trim() === "") {
				processedLines.push(processedLine);
			}
		}

		return processedLines.join("\n");
	}

	/**
	 * Remove linhas marcadas com //no-bundle
	 */
	private static removeNoBundleLines(content: string): string {
		const lines = content.split("\n");
		const filtered: string[] = [];
		const noBundlePattern = APP_CONFIG.bundler.NO_BUNDLE_PATTERN;

		for (const line of lines) {
			if (noBundlePattern.test(line)) {
				continue;
			}
			filtered.push(line);
		}

		return filtered.join("\n");
	}
}
