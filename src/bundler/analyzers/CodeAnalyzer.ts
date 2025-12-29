import * as ts from "typescript";
import { APP_CONFIG } from "@/config/config";
import { StringUtils } from "@common/utils";
import { ASTCache } from "../utils/ASTCache";

/**
 * Analisador de código focado em declarações e uso de identificadores
 * Para análise de imports, use ImportAnalyzer
 */
export class CodeAnalyzer {
	/**
	 * Identifica declarações não utilizadas
	 */
	public static findUnusedDeclarations(content: string): Set<string> {
		const declared = this.analyzeDeclared(content);
		const used = this.analyzeUsage(content);
		const unused = new Set<string>();

		declared.forEach(name => {
			if (!used.has(name) && !StringUtils.isPascalCase(name)) {
				unused.add(name);
			}
		});

		return unused;
	}

	/**
	 * Identifica todas as declarações no código
	 */
	public static analyzeDeclared(content: string): Set<string> {
		const declared = new Set<string>();
		const sourceFile = ASTCache.getSourceFile(
			content,
			APP_CONFIG.bundler.TEMP_FILE_NAME,
		);

		const visit = (node: ts.Node) => {
			// Funções
			if (ts.isFunctionDeclaration(node) && node.name) {
				declared.add(node.name.text);
			}
			// Variáveis e constantes
			else if (ts.isVariableStatement(node)) {
				node.declarationList.declarations.forEach(decl => {
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
	 * Identifica todos os identificadores usados no código
	 */
	public static analyzeUsage(content: string): Set<string> {
		const used = new Set<string>();

		const codeWithoutImports = content
			.split("\n")
			.filter(line => !line.trim().startsWith("import "))
			.join("\n");

		const sourceFile = ASTCache.getSourceFile(
			codeWithoutImports,
			APP_CONFIG.bundler.TEMP_FILE_NAME,
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
	 * Verifica se um identificador está em posição de declaração
	 */
	private static isDeclarationPosition(
		node: ts.Identifier,
		parent: ts.Node,
	): boolean {
		return (
			(ts.isFunctionDeclaration(parent) &&
				(parent as ts.FunctionDeclaration).name === node) ||
			(ts.isVariableDeclaration(parent) &&
				(parent as ts.VariableDeclaration).name === node) ||
			(ts.isClassDeclaration(parent) &&
				(parent as ts.ClassDeclaration).name === node) ||
			(ts.isParameter(parent) &&
				(parent as ts.ParameterDeclaration).name === node) ||
			(ts.isInterfaceDeclaration(parent) &&
				(parent as ts.InterfaceDeclaration).name === node) ||
			(ts.isTypeAliasDeclaration(parent) &&
				(parent as ts.TypeAliasDeclaration).name === node)
		);
	}
}
