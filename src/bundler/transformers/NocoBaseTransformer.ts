import { BundlerConfig } from "../config/BundlerConfig";

/**
 * Processador de comentários especiais do bundle
 */
export class CommentProcessor {
	/**
	 * Processa comentários bundle-only e remove outros comentários
	 * Linhas com //bundle-only: <code> são substituídas apenas pelo código
	 * Outros comentários inline e de bloco são removidos
	 */
	public static processComments(content: string): string {
		const lines = content.split("\n");
		const processedLines: string[] = [];
		let inMultilineComment = false;

		for (const line of lines) {
			// Detecta início/fim de comentário multilinha
			if (line.includes("/*")) {
				inMultilineComment = true;
			}

			// Pula linhas dentro de comentário multilinha
			if (inMultilineComment) {
				if (line.includes("*/")) {
					inMultilineComment = false;
				}
				continue;
			}

			// Processa linha com bundle-only
			const bundleOnlyMatch = line.match(/^\s*\/\/bundle-only:\s*(.+)$/);
			if (bundleOnlyMatch) {
				const indent = line.match(/^(\s*)/)?.[1] || "";
				processedLines.push(indent + bundleOnlyMatch[1]);
				continue;
			}

			// Remove comentários inline (mas preserva URLs como http://)
			let processedLine = line.replace(/([^:])\/\/.*$/, "$1").trimEnd();

			// Adiciona linha se não estiver vazia ou se for quebra intencional
			if (processedLine.trim() !== "" || line.trim() === "") {
				processedLines.push(processedLine);
			}
		}

		return processedLines.join("\n");
	}

	/**
	 * Remove todos os comentários de um código
	 */
	public static removeAllComments(content: string): string {
		let result = content;

		// Remove comentários de bloco /* ... */
		result = result.replace(/\/\*[\s\S]*?\*\//g, "");

		// Remove comentários inline // (mas não URLs)
		result = result.replace(/([^:])\/\/.*$/gm, "$1");

		// Remove linhas vazias excessivas
		result = result.replace(/\n\s*\n\s*\n/g, "\n\n");

		return result.trim();
	}

	/**
	 * Remove comentários preservando JSDoc
	 */
	public static removeNonDocComments(content: string): string {
		const lines = content.split("\n");
		const result: string[] = [];
		let inJSDoc = false;

		for (const line of lines) {
			const trimmed = line.trim();

			// Detecta início de JSDoc
			if (trimmed.startsWith("/**")) {
				inJSDoc = true;
			}

			// Mantém linhas de JSDoc
			if (inJSDoc) {
				result.push(line);
				if (trimmed.endsWith("*/")) {
					inJSDoc = false;
				}
				continue;
			}

			// Remove outros comentários
			if (trimmed.startsWith("//") || trimmed.startsWith("/*")) {
				continue;
			}

			result.push(line);
		}

		return result.join("\n");
	}
}

/**
 * Transforma imports para o formato do NocoBase
 */
export class ImportTransformer {
	/**
	 * Transforma imports para usar ctx.libs do NocoBase
	 * import { useState } from 'react' -> const { useState } = ctx.libs.React
	 */
	public static transformImports(content: string): string {
		const lines = content.split("\n");
		const transformedLines: string[] = [];
		const libraries = new Map<string, Set<string>>();

		// Primeira passagem: coleta todos os imports
		for (const line of lines) {
			const trimmed = line.trim();

			if (trimmed.startsWith("import ")) {
				const parsed = this.parseImportLine(line);
				if (parsed) {
					const { moduleName, importedNames } = parsed;

					// Ignora imports do ctx (@/nocobase/ctx)
					if (moduleName === "@/nocobase/ctx" || moduleName.includes("/nocobase/ctx")) {
						continue;
					}

					if (!libraries.has(moduleName)) {
						libraries.set(moduleName, new Set());
					}

					importedNames.forEach((name) => libraries.get(moduleName)!.add(name));
				}
				continue; // Não adiciona a linha original
			}

			transformedLines.push(line);
		}

		// Segunda passagem: gera destructuring do ctx.libs
		if (libraries.size > 0) {
			const destructuringLines = this.generateDestructuring(libraries);
			const insertIndex = this.findInsertionPoint(transformedLines);
			transformedLines.splice(insertIndex, 0, ...destructuringLines, "");
		}

		return transformedLines.join("\n");
	}

	/**
	 * Faz parse de uma linha de import
	 */
	private static parseImportLine(
		line: string
	): { moduleName: string; importedNames: string[] } | null {
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
				.map((n) => n.trim())
				.filter((n) => n);
			importedNames.push(...names);
		}

		// Default + Named: import React, { useState } from 'react'
		if (line.includes(",") && line.includes("{")) {
			const defaultNamedMatch = line.match(/import\s+(\w+)\s*,\s*\{([^}]+)\}/);
			if (defaultNamedMatch) {
				importedNames.length = 0;
				importedNames.push(defaultNamedMatch[1]);
				const names = defaultNamedMatch[2]
					.split(",")
					.map((n) => n.trim())
					.filter((n) => n);
				importedNames.push(...names);
			}
		}

		return { moduleName, importedNames };
	}

	/**
	 * Gera linhas de destructuring do ctx.libs
	 */
	private static generateDestructuring(
		libraries: Map<string, Set<string>>
	): string[] {
		const lines: string[] = [];

		libraries.forEach((names, moduleName) => {
			const uniqueNames = [...new Set(names)];
			const libKey = BundlerConfig.getLibraryKey(moduleName);
			lines.push(`const { ${uniqueNames.join(", ")} } = ctx.libs.${libKey};`);
		});

		return lines;
	}

	/**
	 * Encontra o ponto de inserção para o destructuring
	 */
	private static findInsertionPoint(lines: string[]): number {
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			// Insere após comentários de cabeçalho
			if (!line.startsWith("//") && line !== "") {
				return i;
			}
		}
		return 0;
	}
}

/**
 * Transforma código para o formato do NocoBase
 */
export class NocoBaseTransformer {
	/**
	 * Transforma imports para usar ctx.libs
	 */
	public static transformImports(content: string): string {
		return ImportTransformer.transformImports(content);
	}

	/**
	 * Processa comentários bundle-only e remove outros
	 */
	public static processComments(content: string): string {
		return CommentProcessor.processComments(content);
	}

	/**
	 * Remove todos os comentários
	 */
	public static removeAllComments(content: string): string {
		return CommentProcessor.removeAllComments(content);
	}

	/**
	 * Aplica todas as transformações do NocoBase
	 */
	public static transform(content: string): string {
		let transformed = content;
		transformed = this.transformImports(transformed);
		transformed = this.processComments(transformed);
		return transformed;
	}
}
