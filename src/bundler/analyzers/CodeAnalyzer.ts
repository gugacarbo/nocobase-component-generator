import * as ts from "typescript";
import { PathUtils } from "../../common/utils/PathUtils";
import { APP_CONFIG } from "@/config/config";

export interface ImportInfo {
	moduleName: string;
	importedNames: string[];
	isExternal: boolean;
	isDefault: boolean;
	hasNamedImports: boolean;
}

// [ Analisa uso e declaração de identificadores no código ]

export class CodeAnalyzer {
	// [ Identifica declarações não utilizadas ]
	public static findUnusedDeclarations(content: string): Set<string> {
		const declared = this.analyzeDeclared(content);
		const used = this.analyzeUsage(content);
		const unused = new Set<string>();

		declared.forEach(name => {
			// Não marca como não usado se for um componente React
			const isComponent = name[0] === name[0].toUpperCase();
			if (!used.has(name) && !isComponent) {
				unused.add(name);
			}
		});

		return unused;
	}

	// [ Identifica todas as declarações no código ]
	public static analyzeDeclared(content: string): Set<string> {
		const declared = new Set<string>();
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
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

	// [ Identifica todos os identificadores usados no código ]
	public static analyzeUsage(content: string): Set<string> {
		const used = new Set<string>();

		//| Remove imports temporariamente para não contá-los
		const codeWithoutImports = this.removeImportLines(content);

		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			codeWithoutImports,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
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

	// [ Remove linhas de import de um conteúdo ]
	private static removeImportLines(content: string): string {
		return content
			.split("\n")
			.filter(line => !line.trim().startsWith("import "))
			.join("\n");
	}

	// [ Verifica se um identificador está em posição de declaração ]
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
	//[ Analisa todos os arquivos e extrai informações de imports externos ]
	public static analyzeExternalImports(
		files: Map<string, string>,
	): Map<string, Set<string>> {
		const externalImports = new Map<string, Set<string>>();

		files.forEach(content => {
			const imports = this.extractImports(content);
			imports
				.filter(imp => imp.isExternal)
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

	// [ Extrai todos os imports de um conteúdo ]
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

	// [ Gera declarações de import formatadas ]
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

	// [ Formata uma declaração de import ]
	private static formatImportStatement(
		moduleName: string,
		names: string[],
	): string | null {
		if (names.length === 0) return null;

		// Identifica default import (começa com maiúscula, não é hook)
		const defaultImport = names.find(
			name => name[0] === name[0].toUpperCase() && !name.startsWith("use"),
		);

		const namedImports = names.filter(name => name !== defaultImport);

		if (defaultImport && namedImports.length > 0) {
			return `import ${defaultImport}, { ${namedImports.join(", ")} } from '${moduleName}'`;
		} else if (defaultImport) {
			return `import ${defaultImport} from '${moduleName}'`;
		} else if (namedImports.length > 0) {
			return `import { ${namedImports.join(", ")} } from '${moduleName}'`;
		}

		return null;
	}

	// [ Remove imports não utilizados ]
	public static removeUnusedImports(
		content: string,
		usedIdentifiers: Set<string>,
	): string {
		const lines = content.split("\n");
		const filteredLines: string[] = [];

		for (const line of lines) {
			if (!line.trim().startsWith("import ")) {
				filteredLines.push(line);
				continue;
			}

			// Parse usando AST (mais robusto)
			const sourceFile = ts.createSourceFile(
				APP_CONFIG.bundler.TEMP_FILE_NAME,
				line,
				ts.ScriptTarget.Latest,
				true,
				ts.ScriptKind.TSX,
			);

			let importInfo: ImportInfo | null = null;
			const self = this;
			ts.forEachChild(sourceFile, function (node) {
				if (ts.isImportDeclaration(node)) {
					importInfo = self.parseImportDeclaration(node);
				}
			});

			if (!importInfo) {
				filteredLines.push(line);
				continue;
			}

			// Type assertion para corrigir inferência do TypeScript
			const info = importInfo as ImportInfo;
			const usedNames = info.importedNames.filter((name: string) =>
				usedIdentifiers.has(name),
			);

			if (usedNames.length === 0) {
				continue; // Remove import não usado
			}

			if (usedNames.length === info.importedNames.length) {
				filteredLines.push(line); // Mantém import original
				continue;
			}

			// Reconstrói import apenas com nomes usados
			const newLine = self.formatImportStatement(info.moduleName, usedNames);
			if (newLine) {
				filteredLines.push(newLine);
			}
		}

		return filteredLines.join("\n");
	}

	// [ Faz parse de uma declaração de import ]
	private static parseImportDeclaration(
		node: ts.ImportDeclaration,
	): ImportInfo | null {
		const moduleSpecifier = node.moduleSpecifier;
		if (!ts.isStringLiteral(moduleSpecifier)) {
			return null;
		}

		const moduleName = moduleSpecifier.text;
		// Considera alias como import interno
		const isExternal =
			PathUtils.isExternalModule(moduleName) && !PathUtils.isAlias(moduleName);
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
					namedBindings.elements.forEach(element => {
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
}
