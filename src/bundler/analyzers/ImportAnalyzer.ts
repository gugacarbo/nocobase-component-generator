import * as ts from "typescript";
import { PathUtils } from "../utils/PathUtils";

export interface ImportInfo {
	moduleName: string;
	importedNames: string[];
	isExternal: boolean;
	isDefault: boolean;
	hasNamedImports: boolean;
}

/**
 * Analisa imports em arquivos TypeScript/JavaScript
 */
export class ImportAnalyzer {
	/**
	 * Analisa todos os arquivos e extrai informações de imports externos
	 */
	public static analyzeExternalImports(
		files: Map<string, string>
	): Map<string, Set<string>> {
		const externalImports = new Map<string, Set<string>>();

		files.forEach((content) => {
			const imports = this.extractImports(content);
			imports
				.filter((imp) => imp.isExternal)
				.forEach((imp) => {
					if (!externalImports.has(imp.moduleName)) {
						externalImports.set(imp.moduleName, new Set());
					}
					imp.importedNames.forEach((name) =>
						externalImports.get(imp.moduleName)!.add(name)
					);
				});
		});

		return externalImports;
	}

	/**
	 * Extrai todos os imports de um conteúdo
	 */
	public static extractImports(content: string): ImportInfo[] {
		const imports: ImportInfo[] = [];
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX
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
	 * Faz parse de uma declaração de import
	 */
	private static parseImportDeclaration(
		node: ts.ImportDeclaration
	): ImportInfo | null {
		const moduleSpecifier = node.moduleSpecifier;
		if (!ts.isStringLiteral(moduleSpecifier)) {
			return null;
		}

		const moduleName = moduleSpecifier.text;
		const isExternal = PathUtils.isExternalModule(moduleName);
		const importedNames: string[] = [];
		let isDefault = false;
		let hasNamedImports = false;

		if (node.importClause) {
			const { name, namedBindings } = node.importClause;

			// Default import
			if (name) {
				importedNames.push(name.text);
				isDefault = true;
			}

			// Named imports
			if (namedBindings) {
				hasNamedImports = true;
				if (ts.isNamedImports(namedBindings)) {
					namedBindings.elements.forEach((element) => {
						importedNames.push(element.name.text);
					});
				}
				// Namespace import: import * as React from 'react'
				else if (ts.isNamespaceImport(namedBindings)) {
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
		};
	}

	/**
	 * Gera declarações de import formatadas
	 */
	public static generateImportStatements(
		imports: Map<string, Set<string>>
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
	 * Formata uma declaração de import
	 */
	private static formatImportStatement(
		moduleName: string,
		names: string[]
	): string | null {
		if (names.length === 0) return null;

		// Identifica default import (começa com maiúscula, não é hook)
		const defaultImport = names.find(
			(name) =>
				name[0] === name[0].toUpperCase() && !name.startsWith("use")
		);

		const namedImports = names.filter((name) => name !== defaultImport);

		if (defaultImport && namedImports.length > 0) {
			return `import ${defaultImport}, { ${namedImports.join(", ")} } from '${moduleName}'`;
		} else if (defaultImport) {
			return `import ${defaultImport} from '${moduleName}'`;
		} else if (namedImports.length > 0) {
			return `import { ${namedImports.join(", ")} } from '${moduleName}'`;
		}

		return null;
	}

	/**
	 * Remove imports não utilizados
	 */
	public static removeUnusedImports(
		content: string,
		usedIdentifiers: Set<string>
	): string {
		const lines = content.split("\n");
		const filteredLines: string[] = [];

		for (const line of lines) {
			if (!line.trim().startsWith("import ")) {
				filteredLines.push(line);
				continue;
			}

			const importInfo = this.parseImportLine(line);
			if (!importInfo) {
				filteredLines.push(line);
				continue;
			}

			const usedNames = importInfo.importedNames.filter((name) =>
				usedIdentifiers.has(name)
			);

			if (usedNames.length === 0) {
				continue; // Remove import não usado
			}

			if (usedNames.length === importInfo.importedNames.length) {
				filteredLines.push(line); // Mantém import original
				continue;
			}

			// Reconstrói import apenas com nomes usados
			const newLine = this.rebuildImportLine(
				importInfo.moduleName,
				usedNames
			);
			if (newLine) {
				filteredLines.push(newLine);
			}
		}

		return filteredLines.join("\n");
	}

	/**
	 * Faz parse de uma linha de import (versão simplificada)
	 */
	private static parseImportLine(
		line: string
	): { moduleName: string; importedNames: string[] } | null {
		const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
		if (!moduleMatch) return null;

		const moduleName = moduleMatch[1];
		const importedNames: string[] = [];

		const importMatch = line.match(
			/import\s+(?:(\w+)|{([^}]+)}|(\w+),\s*{([^}]+)})\s+from/
		);
		if (!importMatch) return null;

		const [, defaultImport, namedImports, defaultWithNamed, namedWithDefault] =
			importMatch;

		if (defaultImport) importedNames.push(defaultImport);
		if (defaultWithNamed) importedNames.push(defaultWithNamed);

		const namedStr = namedImports || namedWithDefault;
		if (namedStr) {
			namedStr
				.split(",")
				.map((n) => n.trim())
				.forEach((name) => importedNames.push(name));
		}

		return { moduleName, importedNames };
	}

	/**
	 * Reconstrói uma linha de import
	 */
	private static rebuildImportLine(
		moduleName: string,
		names: string[]
	): string | null {
		return this.formatImportStatement(moduleName, names);
	}
}
