import * as ts from "typescript";
import { APP_CONFIG } from "@/config/config";
import { ModuleResolver } from "../resolvers/ModuleResolver";

export interface ExtractedImport {
	path: string;
	names: string[];
	defaultName: string | null;
	namespaceAlias: string | null;
	isTypeOnly: boolean;
}

export interface ParsedImportClause {
	names: string[];
	defaultName: string | null;
	namespaceAlias: string | null;
	isTypeOnly: boolean;
}

/**
 * Extrai informações de imports de código fonte de forma centralizada
 * Substitui lógica duplicada em FileLoader e DependencyResolver
 */
export class ImportExtractor {
	/**
	 * Extrai todos os imports de um conteúdo usando AST
	 * Retorna informações completas incluindo type imports
	 */
	public static extract(content: string): ExtractedImport[] {
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
				const importInfo = this.parseImportNode(node);
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
	 * Extrai apenas imports locais (relativos e aliases)
	 */
	public static extractLocal(content: string): ExtractedImport[] {
		return this.extract(content).filter(imp =>
			ModuleResolver.isLocal(imp.path),
		);
	}

	/**
	 * Extrai apenas imports externos
	 */
	public static extractExternal(content: string): ExtractedImport[] {
		return this.extract(content).filter(imp =>
			ModuleResolver.isExternal(imp.path),
		);
	}

	/**
	 * Agrupa imports por módulo, consolidando nomes importados
	 */
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

	/**
	 * Extrai imports com nomes (compatibilidade com código legado)
	 * Retorna Map<importPath, string[]>
	 */
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

	/**
	 * Extrai apenas os caminhos de imports locais
	 */
	public static extractPaths(content: string): string[] {
		return this.extractLocal(content).map(imp => imp.path);
	}

	private static parseImportNode(
		node: ts.ImportDeclaration,
	): ExtractedImport | null {
		if (!ts.isStringLiteral(node.moduleSpecifier)) {
			return null;
		}

		const path = node.moduleSpecifier.text;
		const clause = this.parseImportClause(node.importClause);

		return {
			path,
			names: clause.names,
			defaultName: clause.defaultName,
			namespaceAlias: clause.namespaceAlias,
			isTypeOnly: clause.isTypeOnly,
		};
	}

	private static parseImportClause(
		clause: ts.ImportClause | undefined,
	): ParsedImportClause {
		const result: ParsedImportClause = {
			names: [],
			defaultName: null,
			namespaceAlias: null,
			isTypeOnly: false,
		};

		if (!clause) return result;

		result.isTypeOnly = clause.isTypeOnly || false;

		if (clause.name) {
			result.defaultName = clause.name.text;
		}

		if (clause.namedBindings) {
			if (ts.isNamedImports(clause.namedBindings)) {
				clause.namedBindings.elements.forEach(element => {
					result.names.push(element.name.text);
				});
			} else if (ts.isNamespaceImport(clause.namedBindings)) {
				result.namespaceAlias = clause.namedBindings.name.text;
			}
		}

		return result;
	}
}
