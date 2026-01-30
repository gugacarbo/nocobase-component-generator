import * as ts from "typescript";
import { APP_CONFIG } from "@/config/config";
import { ImportInfo } from "../core/types";
import { ModuleResolver } from "../resolvers/ModuleResolver";

export interface ExtractedImport {
	path: string;
	names: string[];
	defaultName: string | null;
	namespaceAlias: string | null;
	isTypeOnly: boolean;
}

/**
 * Analisador centralizado de imports
 * Extrai, analisa, transforma e gerencia declarações de import usando AST
 */
export class ImportAnalyzer {
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

	public static extractDetailed(content: string): ExtractedImport[] {
		const imports: ExtractedImport[] = [];
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			if (ts.isImportDeclaration(node)) {
				const importInfo = this.parseDetailedImport(node);
				if (importInfo) {
					imports.push(importInfo);
				}
			}
			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return imports;
	}

	public static extractLocal(content: string): ExtractedImport[] {
		return this.extractDetailed(content).filter(imp =>
			ModuleResolver.isLocal(imp.path),
		);
	}

	public static extractPaths(content: string): string[] {
		return this.extractLocal(content).map(imp => imp.path);
	}

	public static extractWithNames(content: string): Map<string, string[]> {
		const result = new Map<string, string[]>();
		const imports = this.extractLocal(content);

		for (const imp of imports) {
			const allNames = [...imp.names];
			if (imp.defaultName) allNames.push(imp.defaultName);
			if (imp.namespaceAlias) allNames.push(imp.namespaceAlias);

			if (result.has(imp.path)) {
				const existing = result.get(imp.path)!;
				allNames.forEach(name => {
					if (!existing.includes(name)) existing.push(name);
				});
			} else {
				result.set(imp.path, allNames);
			}
		}

		return result;
	}

	public static groupByModule(
		imports: ExtractedImport[],
	): Map<string, ExtractedImport> {
		const grouped = new Map<string, ExtractedImport>();

		for (const imp of imports) {
			const existing = grouped.get(imp.path);
			if (existing) {
				existing.names = [...new Set([...existing.names, ...imp.names])];
				if (imp.defaultName && !existing.defaultName) {
					existing.defaultName = imp.defaultName;
				}
				if (imp.namespaceAlias && !existing.namespaceAlias) {
					existing.namespaceAlias = imp.namespaceAlias;
				}
			} else {
				grouped.set(imp.path, { ...imp });
			}
		}

		return grouped;
	}

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

	private static parseDetailedImport(
		node: ts.ImportDeclaration,
	): ExtractedImport | null {
		if (!ts.isStringLiteral(node.moduleSpecifier)) {
			return null;
		}

		const path = node.moduleSpecifier.text;
		const result: ExtractedImport = {
			path,
			names: [],
			defaultName: null,
			namespaceAlias: null,
			isTypeOnly: false,
		};

		if (!node.importClause) return result;

		result.isTypeOnly = node.importClause.isTypeOnly || false;

		if (node.importClause.name) {
			result.defaultName = node.importClause.name.text;
		}

		if (node.importClause.namedBindings) {
			if (ts.isNamedImports(node.importClause.namedBindings)) {
				node.importClause.namedBindings.elements.forEach(element => {
					result.names.push(element.name.text);
				});
			} else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
				result.namespaceAlias = node.importClause.namedBindings.name.text;
			}
		}

		return result;
	}

	private static formatImportStatement(
		moduleName: string,
		names: string[],
	): string | null {
		if (names.length === 0) return null;

		const allNamed = names.join(", ");
		return `import { ${allNamed} } from '${moduleName}'`;
	}
}
