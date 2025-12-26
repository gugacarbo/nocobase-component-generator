import * as prettier from "prettier";
import { Logger } from "../../common/Logger";
import { APP_CONFIG } from "@/config/config";

/**
 * Formata código usando Prettier
 */
export class CodeFormatter {
	/**
	 * Formata código com Prettier
	 */
	public static async format(
		content: string,
		isTypeScript: boolean,
	): Promise<string> {
		try {
			const config = {
				...APP_CONFIG.bundler.PRETTIER_CONFIG,
				parser: isTypeScript ? ("typescript" as const) : ("babel" as const),
			};

			const formatted = await prettier.format(content, config);
			return formatted;
		} catch (error) {
			Logger.warning("Erro ao formatar código, retornando original");
			return this.formatBasic(content);
		}
	}

	/**
	 * Formatação básica sem Prettier (fallback)
	 */
	public static formatBasic(content: string): string {
		let formatted = content;

		// Remove espaços extras no final das linhas
		formatted = formatted.replace(/[ \t]+$/gm, "");

		// Garante linha vazia no final
		if (!formatted.endsWith("\n")) {
			formatted += "\n";
		}

		// Remove mais de 2 linhas vazias consecutivas
		formatted = formatted.replace(/\n{3,}/g, "\n\n");

		return formatted;
	}
}
