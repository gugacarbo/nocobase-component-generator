import { Logger } from "@/common/Logger";
import { FileLoader } from "../processors/FileLoader";

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
}

/**
 * Validações de entrada para o bundler
 */
export class BundlerValidator {
	/**
	 * Valida os argumentos de entrada do bundler
	 */
	public static validateInputs(
		srcPath: string,
		outputDir: string,
	): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
		};

		if (!srcPath || srcPath.trim() === "") {
			result.errors.push("srcPath não pode ser vazio");
			result.isValid = false;
		}

		if (!outputDir || outputDir.trim() === "") {
			result.errors.push("outputDir não pode ser vazio");
			result.isValid = false;
		}

		if (srcPath && srcPath.trim() !== "") {
			const srcExists =
				FileLoader.fileExists(srcPath) || FileLoader.directoryExists(srcPath);
			if (!srcExists) {
				result.errors.push(`Path não encontrado: ${srcPath}`);
				result.isValid = false;
			}
		}

		return result;
	}

	/**
	 * Valida o conteúdo do bundle gerado
	 */
	public static validateBundle(content: string): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
		};

		if (!content || content.trim() === "") {
			result.errors.push("Bundle gerado está vazio");
			result.isValid = false;
			return result;
		}

		if (!content.includes("ctx.render") && !content.includes("export")) {
			result.warnings.push(
				"Bundle não contém ctx.render nem export - verifique se há componente principal",
			);
		}

		const suspiciousPatterns = [
			{
				pattern: /import\s+.*from\s+['"]\.\//,
				message: "Import relativo não processado",
			},
			{
				pattern: /import\s+.*from\s+['"]\.\.\//,
				message: "Import relativo não processado",
			},
			{ pattern: /export\s+default/, message: "Export default não removido" },
		];

		for (const { pattern, message } of suspiciousPatterns) {
			if (pattern.test(content)) {
				result.warnings.push(message);
			}
		}

		return result;
	}

	/**
	 * Valida arquivos carregados
	 */
	public static validateLoadedFiles(
		files: Map<string, unknown>,
	): ValidationResult {
		const result: ValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
		};

		if (files.size === 0) {
			result.errors.push("Nenhum arquivo suportado encontrado para processar");
			result.isValid = false;
		}

		return result;
	}

	/**
	 * Loga os resultados da validação
	 */
	public static logValidation(result: ValidationResult, context: string): void {
		if (!result.isValid) {
			result.errors.forEach(err => {
				Logger.error(`[${context}] ${err}`);
			});
		}

		result.warnings.forEach(warn => {
			Logger.warning(`[${context}] ${warn}`);
		});
	}
}
