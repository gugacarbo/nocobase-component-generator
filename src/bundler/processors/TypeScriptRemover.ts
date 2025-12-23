import { Logger } from "@/common/Logger";
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

	// [ Remove tipos, interfaces, enums e outras anotações TypeScript ]
	public static removeTypes(
		content: string,
		fileName: string = "source.tsx",
	): string {
		try {
			const result = ts.transpileModule(content, {
				compilerOptions: this.DEFAULT_COMPILER_OPTIONS,
				fileName,
			});

			return result.outputText;
		} catch (error) {
			Logger.error(
				"Erro ao remover tipos TypeScript, retornando conteúdo original:",
				error,
			);
			return content;
		}
	}
}
