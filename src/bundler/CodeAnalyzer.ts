import * as ts from "typescript";

/**
 * Analisa o código para identificar imports necessários e funções utilizadas
 */
export class CodeAnalyzer {
	private externalImports: Map<string, Set<string>> = new Map();

	/**
	 * Analisa todos os arquivos e identifica imports externos necessários
	 */
	public analyzeImports(files: Map<string, string>): Map<string, Set<string>> {
		this.externalImports.clear();

		files.forEach(content => {
			this.extractExternalImports(content);
		});

		return this.externalImports;
	}

	/**
	 * Extrai imports externos (node_modules) de um arquivo
	 */
	private extractExternalImports(content: string): void {
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			// Verifica import declarations
			if (ts.isImportDeclaration(node)) {
				const moduleSpecifier = node.moduleSpecifier;
				if (ts.isStringLiteral(moduleSpecifier)) {
					const moduleName = moduleSpecifier.text;

					// Só processa imports externos (não relativos)
					if (!moduleName.startsWith(".") && !moduleName.startsWith("/")) {
						const importedNames = this.extractImportNames(node);

						if (!this.externalImports.has(moduleName)) {
							this.externalImports.set(moduleName, new Set());
						}

						importedNames.forEach(name => {
							this.externalImports.get(moduleName)!.add(name);
						});
					}
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
	}

	/**
	 * Extrai os nomes importados de uma declaração de import
	 */
	private extractImportNames(node: ts.ImportDeclaration): string[] {
		const names: string[] = [];

		if (node.importClause) {
			const {name, namedBindings} = node.importClause;

			// Default import: import React from 'react'
			if (name) {
				names.push(name.text);
			}

			// Named imports: import { useState, useEffect } from 'react'
			if (namedBindings) {
				if (ts.isNamedImports(namedBindings)) {
					namedBindings.elements.forEach(element => {
						names.push(element.name.text);
					});
				}
				// Namespace import: import * as React from 'react'
				else if (ts.isNamespaceImport(namedBindings)) {
					names.push(namedBindings.name.text);
				}
			}
		}

		return names;
	}

	/**
	 * Gera as declarações de import para o início do bundle
	 */
	public generateImportStatements(imports: Map<string, Set<string>>): string {
		let importStatements = "";

		imports.forEach((names, moduleName) => {
			const namesList = Array.from(names).sort();

			// Identifica default imports (geralmente começam com maiúscula ou são palavras conhecidas)
			const defaultImport = namesList.find(name => {
				const firstChar = name[0];
				// Default imports: React, ReactDOM, etc (começam com maiúscula e não são hooks)
				return firstChar === firstChar.toUpperCase() && !name.startsWith("use");
			});

			const namedImports = namesList.filter(name => name !== defaultImport);

			if (defaultImport && namedImports.length > 0) {
				// import React, { useState, useEffect } from 'react'
				importStatements += `import ${defaultImport}, { ${namedImports.join(
					", ",
				)} } from '${moduleName}'\n`;
			} else if (defaultImport) {
				// import React from 'react'
				importStatements += `import ${defaultImport} from '${moduleName}'\n`;
			} else if (namedImports.length > 0) {
				// import { useState, useEffect } from 'react'
				importStatements += `import { ${namedImports.join(
					", ",
				)} } from '${moduleName}'\n`;
			}
		});

		return importStatements ? importStatements + "\n" : "";
	}

	/**
	 * Identifica identificadores usados no código (excluindo imports)
	 */
	public analyzeUsage(content: string): Set<string> {
		const used = new Set<string>();
		
		// Remove temporariamente as linhas de import para não contá-las
		const lines = content.split('\n');
		const codeWithoutImports = lines
			.filter(line => !line.trim().startsWith('import '))
			.join('\n');
		
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
			codeWithoutImports,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			// Identifica uso de identificadores (não em declarações)
			if (ts.isIdentifier(node)) {
				const parent = node.parent;
				
				// Não conta identificadores em posições de declaração
				const isDeclarationPosition = 
					(ts.isFunctionDeclaration(parent) && parent.name === node) ||
					(ts.isVariableDeclaration(parent) && parent.name === node) ||
					(ts.isClassDeclaration(parent) && parent.name === node) ||
					(ts.isParameter(parent) && parent.name === node);
				
				if (!isDeclarationPosition) {
					used.add(node.text);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return used;
	}

	/**
	 * Identifica funções e variáveis declaradas
	 */
	public analyzeDeclared(content: string): Set<string> {
		const declared = new Set<string>();
		const sourceFile = ts.createSourceFile(
			"temp.tsx",
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
			// Arrow functions e const functions
			else if (ts.isVariableDeclaration(node)) {
				if (ts.isIdentifier(node.name)) {
					declared.add(node.name.text);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return declared;
	}

	/**
	 * Remove imports não utilizados do código final
	 */
	public removeUnusedImports(
		content: string,
		usedIdentifiers: Set<string>,
	): string {
		const lines = content.split("\n");
		const filteredLines: string[] = [];

		for (const line of lines) {
			// Se não é uma linha de import, mantém
			if (!line.trim().startsWith("import ")) {
				filteredLines.push(line);
				continue;
			}

			// Extrai nomes importados da linha
			const importMatch = line.match(
				/import\s+(?:(\w+)|{([^}]+)}|(\w+),\s*{([^}]+)})\s+from/,
			);
			if (!importMatch) {
				filteredLines.push(line);
				continue;
			}

			const [
				,
				defaultImport,
				namedImportsStr,
				defaultWithNamed,
				namedWithDefaultStr,
			] = importMatch;
			const importedNames: string[] = [];

			// Default import
			if (defaultImport) {
				importedNames.push(defaultImport);
			}
			if (defaultWithNamed) {
				importedNames.push(defaultWithNamed);
			}

			// Named imports
			const namedStr = namedImportsStr || namedWithDefaultStr;
			if (namedStr) {
				const names = namedStr.split(",").map(n => n.trim());
				importedNames.push(...names);
			}

			// Verifica quais imports são realmente usados
			const usedNames = importedNames.filter(name => usedIdentifiers.has(name));

			// Se nenhum import é usado, remove a linha
			if (usedNames.length === 0) {
				continue;
			}

			// Se todos são usados, mantém a linha original
			if (usedNames.length === importedNames.length) {
				filteredLines.push(line);
				continue;
			}

			// Reconstrói a linha de import apenas com os usados
			const moduleName = line.match(/from\s+['"]([^'"]+)['"]/)?.[1];
			if (moduleName) {
				const hasDefault = usedNames.find(
					n => n[0] === n[0].toUpperCase() && !n.startsWith("use"),
				);
				const namedUsed = usedNames.filter(n => n !== hasDefault);

				if (hasDefault && namedUsed.length > 0) {
					filteredLines.push(
						`import ${hasDefault}, { ${namedUsed.join(
							", ",
						)} } from '${moduleName}'`,
					);
				} else if (hasDefault) {
					filteredLines.push(`import ${hasDefault} from '${moduleName}'`);
				} else if (namedUsed.length > 0) {
					filteredLines.push(
						`import { ${namedUsed.join(", ")} } from '${moduleName}'`,
					);
				}
			}
		}

		return filteredLines.join("\n");
	}
}
