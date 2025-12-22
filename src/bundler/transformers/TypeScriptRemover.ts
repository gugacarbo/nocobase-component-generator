import * as ts from "typescript";

/**
 * Remove anotações de tipo TypeScript usando o compilador oficial
 */
export class TypeScriptRemover {
	/**
	 * Configurações padrão do compilador
	 */
	private static readonly DEFAULT_COMPILER_OPTIONS: ts.CompilerOptions = {
		target: ts.ScriptTarget.ESNext,
		module: ts.ModuleKind.ESNext,
		jsx: ts.JsxEmit.Preserve,
		removeComments: false,
		isolatedModules: true,
		skipLibCheck: true,
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
	};

	/**
	 * Remove tipos, interfaces, enums e outras anotações TypeScript
	 */
	public static removeTypes(
		content: string,
		fileName: string = "source.tsx"
	): string {
		try {
			const result = ts.transpileModule(content, {
				compilerOptions: this.DEFAULT_COMPILER_OPTIONS,
				fileName,
			});

			return result.outputText;
		} catch (error) {
			console.warn(
				"Erro ao remover tipos TypeScript, retornando conteúdo original:",
				error
			);
			return content;
		}
	}

	/**
	 * Remove tipos de forma customizada com opções específicas
	 */
	public static removeTypesWithOptions(
		content: string,
		fileName: string,
		options: Partial<ts.CompilerOptions>
	): string {
		const compilerOptions = {
			...this.DEFAULT_COMPILER_OPTIONS,
			...options,
		};

		try {
			const result = ts.transpileModule(content, {
				compilerOptions,
				fileName,
			});

			return result.outputText;
		} catch (error) {
			console.warn("Erro ao remover tipos TypeScript:", error);
			return content;
		}
	}

	/**
	 * Verifica se um arquivo é TypeScript
	 */
	public static isTypeScriptFile(filePath: string): boolean {
		return /\.tsx?$/.test(filePath);
	}

	/**
	 * Verifica se um código contém sintaxe TypeScript
	 */
	public static hasTypeScriptSyntax(content: string): boolean {
		// Verifica por padrões comuns de TypeScript
		const tsPatterns = [
			/:\s*\w+\s*[=,;\)]/, // Type annotations
			/interface\s+\w+/, // Interfaces
			/type\s+\w+\s*=/, // Type aliases
			/<\w+>/, // Generic types
			/enum\s+\w+/, // Enums
			/as\s+\w+/, // Type assertions
		];

		return tsPatterns.some((pattern) => pattern.test(content));
	}
}
