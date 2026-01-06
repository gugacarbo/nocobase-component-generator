import * as ts from "typescript";
import { Logger } from "@common/Logger";
import { CodeAnalyzer } from "../analyzers/CodeAnalyzer";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { APP_CONFIG } from "@/config/config";

/**
 * Remove código não utilizado (tree shaking / dead code elimination)
 */
export class TreeShaker {
	/**
	 * Remove declarações não utilizadas do código
	 */
	public static shake(content: string): string {
		try {
			const unused = CodeAnalyzer.findUnusedDeclarations(content);

			if (unused.size === 0) {
				return content;
			}

			Logger.info.verbose(
				`Removendo ${unused.size} declarações não utilizadas`,
			);
			const codeContent = this.removeUnusedCode(content, unused);

			const usedIdentifiers = CodeAnalyzer.analyzeUsage(codeContent);
			return ImportAnalyzer.removeUnusedImports(codeContent, usedIdentifiers);
		} catch (error) {
			const err = error instanceof Error ? error : new Error(String(error));
			Logger.error.verbose("Erro durante tree shaking", err);
			Logger.warning("Retornando código original sem tree shaking");
			return content;
		}
	}

	/**
	 * Remove código não utilizado
	 */
	public static removeUnusedCode(content: string, unused: Set<string>): string {
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const nodesToRemove: ts.Node[] = [];

		const visit = (node: ts.Node) => {
			if (ts.isFunctionDeclaration(node) && node.name) {
				if (unused.has(node.name.text)) {
					nodesToRemove.push(node);
				}
			} else if (ts.isVariableStatement(node)) {
				const hasUnused = node.declarationList.declarations.some(decl => {
					if (ts.isIdentifier(decl.name)) {
						return unused.has(decl.name.text);
					}
					return false;
				});
				if (hasUnused) {
					nodesToRemove.push(node);
				}
			} else if (ts.isClassDeclaration(node) && node.name) {
				if (unused.has(node.name.text)) {
					nodesToRemove.push(node);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);

		// Remove os nodos marcados
		let result = content;
		nodesToRemove.reverse().forEach(node => {
			const start = node.getStart(sourceFile);
			const end = node.getEnd();
			result = result.substring(0, start) + result.substring(end);
		});

		// Limpa linhas vazias excessivas
		result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

		return result.trim();
	}
}
