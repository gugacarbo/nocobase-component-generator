import * as ts from "typescript";
import { Logger } from "@common/Logger";
import { CodeAnalyzer } from "../analyzers/CodeAnalyzer";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { APP_CONFIG } from "@/config/config";

interface NodeToRemove {
	start: number;
	end: number;
	name: string;
}

/**
 * Remove código não utilizado (tree shaking / dead code elimination)
 */
export class TreeShaker {
	/**
	 * Remove declarações não utilizadas do código
	 */
	public static shake(content: string, mainComponent: string): string {
		try {
			const unused = CodeAnalyzer.findUnusedDeclarations(
				content,
				mainComponent,
			);

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
	 * Remove código não utilizado de forma segura
	 * Coleta todos os nós e remove do final para o início para não afetar índices
	 */
	public static removeUnusedCode(content: string, unused: Set<string>): string {
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const nodesToRemove: NodeToRemove[] = [];

		const visit = (node: ts.Node) => {
			if (ts.isFunctionDeclaration(node) && node.name) {
				if (unused.has(node.name.text)) {
					nodesToRemove.push({
						start: node.getStart(sourceFile),
						end: node.getEnd(),
						name: node.name.text,
					});
				}
			} else if (ts.isVariableStatement(node)) {
				const hasUnused = node.declarationList.declarations.some(decl => {
					if (ts.isIdentifier(decl.name)) {
						return unused.has(decl.name.text);
					}
					return false;
				});
				if (hasUnused) {
					const declName = node.declarationList.declarations[0];
					nodesToRemove.push({
						start: node.getStart(sourceFile),
						end: node.getEnd(),
						name: ts.isIdentifier(declName.name)
							? declName.name.text
							: "unknown",
					});
				}
			} else if (ts.isClassDeclaration(node) && node.name) {
				if (unused.has(node.name.text)) {
					nodesToRemove.push({
						start: node.getStart(sourceFile),
						end: node.getEnd(),
						name: node.name.text,
					});
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);

		if (nodesToRemove.length === 0) {
			return content;
		}

		nodesToRemove.sort((a, b) => b.start - a.start);

		let result = content;
		for (const node of nodesToRemove) {
			result = result.substring(0, node.start) + result.substring(node.end);
			Logger.info.verbose(`Tree-shake: removido "${node.name}"`);
		}

		result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

		return result.trim();
	}
}
