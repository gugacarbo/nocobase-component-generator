import * as ts from "typescript";
import { APP_CONFIG } from "@/config/config";
import { ImportInfo } from "../core/types";
import { ModuleResolver } from "../resolvers/ModuleResolver";

/**
 * Analisador especializado em imports
 * Extrai, analisa, transforma e gerencia declarações de import
 */
export class ImportAnalyzer {
	/**
	 * Analisa todos os arquivos e extrai informações de imports externos
	 */
	public static analyzeExternalImports(
		files: Map<string, string>,
	): Map<string, Set<string>> {
		const externalImports = new Map<string, Set<string>>();

		files.forEach(content => {
			const imports = this.extractImports(content);
			imports
				.filter(imp => imp.isExternal && !imp.isTypeOnly)
				.forEach(imp => {
					if (!externalImports.has(imp.moduleName)) {
						externalImports.set(imp.moduleName, new Set());
					}
					imp.importedNames.forEach(name =>
						externalImports.get(imp.moduleName)!.add(name),
					);
				});
		});

		return externalImports;
	}

	/**
	 * Extrai todos os imports de um conteúdo usando AST
	 */
	public static extractImports(content: string): ImportInfo[] {
		const imports: ImportInfo[] = [];
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			if (ts.isImportDeclaration(node)) {
				const importInfo = this.parseImportDeclaration(node);
				if (importInfo) {
					imports.push(importInfo);
				}
			}
			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return imports;
	}

	/**
	 * Gera declarações de import formatadas
	 */
	public static generateImportStatements(
		imports: Map<string, Set<string>>,
	): string {
		const statements: string[] = [];

		imports.forEach((names, moduleName) => {
			const namesList = Array.from(names).sort();
			const statement = this.formatImportStatement(moduleName, namesList);
			if (statement) {
				statements.push(statement);
			}
		});

		return statements.length > 0 ? statements.join("\n") + "\n\n" : "";
	}

	/**
	 * Remove imports não utilizados do código
	 */
	public static removeUnusedImports(
		content: string,
		usedIdentifiers: Set<string>,
	): string {
		const allImports = this.extractImports(content);
		const lines = content.split("\n");
		const filteredLines: string[] = [];
		const importLineIndices = new Set<number>();

		lines.forEach((line, index) => {
			if (line.trim().startsWith("import ")) {
				importLineIndices.add(index);
			}
		});

		const usedImports: string[] = [];
		for (const importInfo of allImports) {
			const usedNames = importInfo.importedNames.filter(name =>
				usedIdentifiers.has(name),
			);

			if (usedNames.length === 0) {
				continue;
			}

			const newLine = this.formatImportStatement(
				importInfo.moduleName,
				usedNames,
			);
			if (newLine) {
				usedImports.push(newLine);
			}
		}

		let importInserted = false;
		lines.forEach((line, index) => {
			if (importLineIndices.has(index)) {
				if (!importInserted && usedImports.length > 0) {
					filteredLines.push(...usedImports);
					importInserted = true;
				}
			} else {
				filteredLines.push(line);
			}
		});

		return filteredLines.join("\n");
	}

	/**
	 * Faz parse de uma declaração de import usando AST
	 */
	private static parseImportDeclaration(
		node: ts.ImportDeclaration,
	): ImportInfo | null {
		const moduleSpecifier = node.moduleSpecifier;
		if (!ts.isStringLiteral(moduleSpecifier)) {
			return null;
		}

		const moduleName = moduleSpecifier.text;
		const isExternal = ModuleResolver.isExternal(moduleName);
		const importedNames: string[] = [];
		let isDefault = false;
		let hasNamedImports = false;
		let isTypeOnly = false;

		if (node.importClause) {
			const { name, namedBindings, isTypeOnly: typeOnly } = node.importClause;
			isTypeOnly = typeOnly || false;

			if (name) {
				importedNames.push(name.text);
				isDefault = true;
			}

			if (namedBindings) {
				hasNamedImports = true;
				if (ts.isNamedImports(namedBindings)) {
					namedBindings.elements.forEach(element => {
						importedNames.push(element.name.text);
					});
				} else if (ts.isNamespaceImport(namedBindings)) {
					importedNames.push(namedBindings.name.text);
				}
			}
		}

		return {
			moduleName,
			importedNames,
			isExternal,
			isDefault,
			hasNamedImports,
			isTypeOnly,
		};
	}

	/**
	 * Formata uma declaração de import
	 * Diferencia corretamente default vs named imports baseado em análise AST
	 */
	private static formatImportStatement(
		moduleName: string,
		names: string[],
	): string | null {
		if (names.length === 0) return null;

		const allNamed = names.join(", ");
		return `import { ${allNamed} } from '${moduleName}'`;
	}
}
