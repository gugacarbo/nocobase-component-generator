import * as ts from "typescript";

/**
 * Analisa uso e declaração de identificadores no código
 */
export class UsageAnalyzer {
	/**
	 * Identifica todos os identificadores usados no código
	 */
	public static analyzeUsage(content: string): Set<string> {
		const used = new Set<string>();

		// Remove imports temporariamente para não contá-los
		const codeWithoutImports = this.removeImportLines(content);

		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			codeWithoutImports,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);

		const visit = (node: ts.Node) => {
			if (ts.isIdentifier(node)) {
				const parent = node.parent;

				// Não conta identificadores em posições de declaração
				if (!this.isDeclarationPosition(node, parent)) {
					used.add(node.text);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return used;
	}

	/**
	 * Identifica todas as declarações no código
	 */
	public static analyzeDeclared(content: string): Set<string> {
		const declared = new Set<string>();
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
		);

		const visit = (node: ts.Node) => {
			// Funções
			if (ts.isFunctionDeclaration(node) && node.name) {
				declared.add(node.name.text);
			}
			// Variáveis e constantes
			else if (ts.isVariableStatement(node)) {
				node.declarationList.declarations.forEach((decl) => {
					if (ts.isIdentifier(decl.name)) {
						declared.add(decl.name.text);
					}
				});
			}
			// Variáveis individuais
			else if (ts.isVariableDeclaration(node)) {
				if (ts.isIdentifier(node.name)) {
					declared.add(node.name.text);
				}
			}
			// Classes
			else if (ts.isClassDeclaration(node) && node.name) {
				declared.add(node.name.text);
			}
			// Interfaces
			else if (ts.isInterfaceDeclaration(node)) {
				declared.add(node.name.text);
			}
			// Type aliases
			else if (ts.isTypeAliasDeclaration(node)) {
				declared.add(node.name.text);
			}
			// Enums
			else if (ts.isEnumDeclaration(node)) {
				declared.add(node.name.text);
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return declared;
	}

	/**
	 * Identifica declarações não utilizadas
	 */
	public static findUnusedDeclarations(content: string): Set<string> {
		const declared = this.analyzeDeclared(content);
		const used = this.analyzeUsage(content);
		const unused = new Set<string>();

		declared.forEach((name) => {
			// Não marca como não usado se for um componente React
			const isComponent = name[0] === name[0].toUpperCase();
			if (!used.has(name) && !isComponent) {
				unused.add(name);
			}
		});

		return unused;
	}

	/**
	 * Verifica se um identificador está em posição de declaração
	 */
	private static isDeclarationPosition(
		node: ts.Identifier,
		parent: ts.Node
	): boolean {
		return (
			(ts.isFunctionDeclaration(parent) &&
				(parent as ts.FunctionDeclaration).name === node) ||
			(ts.isVariableDeclaration(parent) &&
				(parent as ts.VariableDeclaration).name === node) ||
			(ts.isClassDeclaration(parent) &&
				(parent as ts.ClassDeclaration).name === node) ||
			(ts.isParameter(parent) && (parent as ts.ParameterDeclaration).name === node) ||
			(ts.isInterfaceDeclaration(parent) &&
				(parent as ts.InterfaceDeclaration).name === node) ||
			(ts.isTypeAliasDeclaration(parent) &&
				(parent as ts.TypeAliasDeclaration).name === node)
		);
	}

	/**
	 * Remove linhas de import de um conteúdo
	 */
	private static removeImportLines(content: string): string {
		return content
			.split("\n")
			.filter((line) => !line.trim().startsWith("import "))
			.join("\n");
	}

	/**
	 * Analisa estatísticas de uso do código
	 */
	public static analyzeStatistics(content: string): {
		totalDeclarations: number;
		totalUsages: number;
		unusedDeclarations: number;
		usageRate: number;
	} {
		const declared = this.analyzeDeclared(content);
		const used = this.analyzeUsage(content);
		const unused = this.findUnusedDeclarations(content);

		const totalDeclarations = declared.size;
		const unusedDeclarations = unused.size;
		const usageRate =
			totalDeclarations > 0
				? ((totalDeclarations - unusedDeclarations) / totalDeclarations) * 100
				: 100;

		return {
			totalDeclarations,
			totalUsages: used.size,
			unusedDeclarations,
			usageRate,
		};
	}
}
