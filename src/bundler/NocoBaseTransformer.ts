/**
 * Transforma imports externos para usar a API do NocoBase (ctx.libraries)
 */
export class NocoBaseTransformer {
	/**
	 * Transforma imports para usar ctx.libraries do NocoBase
	 * Exemplo: import { useState } from 'react' -> const { useState } = ctx.libraries.react
	 */
	public static transformImports(content: string): string {
		const lines = content.split("\n");
		const transformedLines: string[] = [];
		const libraries: Map<string, string[]> = new Map();

		// Primeira passagem: coleta todos os imports e remove as linhas
		for (const line of lines) {
			const trimmed = line.trim();

			// Detecta import statements
			if (trimmed.startsWith("import ")) {
				const parsed = this.parseImport(line);
				if (parsed) {
					const { moduleName, importedNames } = parsed;

					// Agrupa imports do mesmo módulo
					if (!libraries.has(moduleName)) {
						libraries.set(moduleName, []);
					}
					libraries.get(moduleName)!.push(...importedNames);
				}
				// Não adiciona a linha original de import
				continue;
			}

			transformedLines.push(line);
		}

		// Segunda passagem: adiciona destructuring do ctx.libraries no início
		if (libraries.size > 0) {
			const destructuringLines: string[] = [];

			libraries.forEach((names, moduleName) => {
				// Remove duplicatas
				const uniqueNames = [...new Set(names)];

				// Converte nome do módulo (react -> React, etc)
				const libKey = this.getLibraryKey(moduleName);

				// Gera a linha de destructuring
				destructuringLines.push(
					`const {${uniqueNames.join(", ")}} = ctx.libs.${libKey};`,
				);
			});

			// Insere no início do código (após comentários de cabeçalho)
			let insertIndex = 0;
			for (let i = 0; i < transformedLines.length; i++) {
				const line = transformedLines[i].trim();
				if (!line.startsWith("//") && line !== "") {
					insertIndex = i;
					break;
				}
			}

			transformedLines.splice(insertIndex, 0, ...destructuringLines, "");
		}

		return transformedLines.join("\n");
	}

	/**
	 * Faz o parse de uma linha de import
	 */
	private static parseImport(
		line: string,
	): { moduleName: string; importedNames: string[] } | null {
		// import React, { useState } from 'react'
		// import { useEffect } from 'react'
		// import React from 'react'

		const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
		if (!moduleMatch) return null;

		const moduleName = moduleMatch[1];
		const importedNames: string[] = [];

		// Default import: import React from 'react'
		const defaultMatch = line.match(/import\s+(\w+)\s*(?:,|from)/);
		if (defaultMatch && !line.includes("{")) {
			importedNames.push(defaultMatch[1]);
		}

		// Named imports: import { useState, useEffect } from 'react'
		const namedMatch = line.match(/\{([^}]+)\}/);
		if (namedMatch) {
			const names = namedMatch[1]
				.split(",")
				.map(n => n.trim())
				.filter(n => n);
			importedNames.push(...names);
		}

		// Default + Named: import React, { useState } from 'react'
		if (line.includes(",") && line.includes("{")) {
			const defaultNamedMatch = line.match(/import\s+(\w+)\s*,\s*\{([^}]+)\}/);
			if (defaultNamedMatch) {
				importedNames.length = 0; // Limpa array
				importedNames.push(defaultNamedMatch[1]);
				const names = defaultNamedMatch[2]
					.split(",")
					.map(n => n.trim())
					.filter(n => n);
				importedNames.push(...names);
			}
		}

		return { moduleName, importedNames };
	}

	/**
	 * Converte nome do módulo npm para a chave do ctx.libraries
	 * react -> React
	 * react-dom -> ReactDOM
	 * @mui/material -> mui (exemplo)
	 */
	private static getLibraryKey(moduleName: string): string {
		// Remove escopo se houver (@mui/material -> material)
		const withoutScope = moduleName.includes("/")
			? moduleName.split("/").pop() || moduleName
			: moduleName;

		// Casos especiais
		const specialCases: Record<string, string> = {
			react: "React",
			"react-dom": "ReactDOM",
			antd: "antd",
			"@formily/core": "formily",
			"@formily/react": "formily",
		};

		if (specialCases[moduleName]) {
			return specialCases[moduleName];
		}

		// Converte kebab-case para PascalCase
		return withoutScope
			.split("-")
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join("");
	}
}
