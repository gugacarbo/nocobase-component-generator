import { RegexPatterns } from "../utils/RegexPatterns";

/**
 * Responsável por processar e remover declarações de export
 */
export class ExportProcessor {
	/**
	 * Remove todas as declarações de export do código
	 */
	public static removeExports(content: string): string {
		let cleaned = content;

		cleaned = cleaned.replace(RegexPatterns.EXPORT_BLOCK, "");
		cleaned = cleaned.replace(RegexPatterns.EXPORT_DEFAULT, "");
		cleaned = cleaned.replace(RegexPatterns.EXPORT_ASYNC, "async ");
		cleaned = cleaned.replace(RegexPatterns.EXPORT_INLINE, "");
		cleaned = cleaned.replace(RegexPatterns.EXPORT_NAMED, "");

		return cleaned;
	}

	/**
	 * Extrai defaultProps do código e retorna separadamente
	 */
	public static extractDefaultProps(content: string): {
		defaultProps: string;
		contentWithout: string;
	} {
		const defaultPropsRegex = /(?:export )?const defaultProps = \{[\s\S]*?\};/;
		const match = content.match(defaultPropsRegex);

		if (!match) {
			return { defaultProps: "", contentWithout: content };
		}

		const defaultPropsDeclaration = match[0].replace(/export\s+/, "").trim();
		const contentWithout = content
			.replace(defaultPropsRegex, "")
			.replace(/\n\s*\n\s*\n/g, "\n\n")
			.trim();

		return { defaultProps: defaultPropsDeclaration, contentWithout };
	}

	/**
	 * Extrai defaultProps e move para o início do conteúdo
	 */
	public static reorderDefaultProps(content: string): string {
		const defaultPropsRegex = /const defaultProps = \{[\s\S]*?\};/;
		const match = content.match(defaultPropsRegex);

		if (!match) {
			return content;
		}

		const defaultPropsDeclaration = match[0];
		const contentWithoutDefaultProps = content
			.replace(defaultPropsRegex, "")
			.trim();

		return `${defaultPropsDeclaration}\n\n${contentWithoutDefaultProps}`;
	}
}
