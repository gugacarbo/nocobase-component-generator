import * as ts from "typescript";
import { Logger } from "../utils/Logger";

/**
 * Remove código não utilizado (tree shaking / dead code elimination)
 */
export class TreeShaker {
	/**
	 * Remove declarações não utilizadas do código
	 */
	public shake(content: string): string {
		try {
			const declarations = this.findDeclarations(content);
			const usages = this.findUsages(content, declarations);
			const mainComponents = this.findMainComponents(declarations);
			const unused = this.findUnused(declarations, usages, mainComponents);

			if (unused.size === 0) {
				return content;
			}

			Logger.info(`Removendo ${unused.size} declarações não utilizadas`);
			return this.removeUnusedCode(content, unused);
		} catch (error) {
			Logger.warning(
				"Erro durante tree shaking, retornando código original"
			);
			return content;
		}
	}

	/**
	 * Identifica todas as declarações no código
	 */
	private findDeclarations(content: string): Set<string> {
		const declarations = new Set<string>();
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);

		const visit = (node: ts.Node) => {
			if (ts.isFunctionDeclaration(node) && node.name) {
				declarations.add(node.name.text);
			} else if (ts.isVariableStatement(node)) {
				node.declarationList.declarations.forEach((decl) => {
					if (ts.isIdentifier(decl.name)) {
						declarations.add(decl.name.text);
					}
				});
			} else if (ts.isClassDeclaration(node) && node.name) {
				declarations.add(node.name.text);
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return declarations;
	}

	/**
	 * Identifica todos os usos no código
	 */
	private findUsages(content: string, declarations: Set<string>): Set<string> {
		const usages = new Set<string>();
		
		// Remove comentários especiais (//bundle-only:) para analisar o código real
		const processedContent = this.removeSpecialComments(content);
		
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			processedContent,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);

		const visit = (node: ts.Node) => {
			if (ts.isIdentifier(node)) {
				const parent = node.parent;
				const isDeclaration =
					ts.isFunctionDeclaration(parent) ||
					ts.isVariableDeclaration(parent) ||
					ts.isClassDeclaration(parent) ||
					ts.isParameter(parent);

				if (!isDeclaration || !declarations.has(node.text)) {
					usages.add(node.text);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return usages;
	}

	/**
	 * Remove comentários especiais do tipo //bundle-only: para análise
	 */
	private removeSpecialComments(content: string): string {
		// Remove //bundle-only: mas mantém o código
		return content.replace(/\/\/bundle-only:\s*/g, "");
	}

	/**
	 * Identifica componentes principais (PascalCase)
	 */
	private findMainComponents(declarations: Set<string>): Set<string> {
		const components = new Set<string>();
		declarations.forEach((decl) => {
			if (decl[0] === decl[0].toUpperCase()) {
				components.add(decl);
			}
		});
		return components;
	}

	/**
	 * Identifica declarações não utilizadas
	 */
	private findUnused(
		declarations: Set<string>,
		usages: Set<string>,
		mainComponents: Set<string>
	): Set<string> {
		const unused = new Set<string>();
		declarations.forEach((decl) => {
			if (!usages.has(decl) && !mainComponents.has(decl)) {
				unused.add(decl);
			}
		});
		return unused;
	}

	/**
	 * Remove código não utilizado
	 */
	private removeUnusedCode(content: string, unused: Set<string>): string {
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);

		const nodesToRemove: ts.Node[] = [];

		const visit = (node: ts.Node) => {
			if (ts.isFunctionDeclaration(node) && node.name) {
				if (unused.has(node.name.text)) {
					nodesToRemove.push(node);
				}
			} else if (ts.isVariableStatement(node)) {
				const hasUnused = node.declarationList.declarations.some((decl) => {
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
		nodesToRemove.reverse().forEach((node) => {
			const start = node.getStart(sourceFile);
			const end = node.getEnd();
			result = result.substring(0, start) + result.substring(end);
		});

		// Limpa linhas vazias excessivas
		result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

		return result.trim();
	}
}
