import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { CommentProcessor } from "../processors/CommentProcessor";
import { LibraryMapper } from "../utils/LibraryMapper";
import { FileValidator } from "../utils/FileValidator";

/**
 * Adaptador para transformações específicas do NocoBase
 */
export class NocoBaseAdapter {
	/**
	 * Processa comentários especiais (//bundle-only e //no-bundle)
	 */
	public static processComments(content: string): string {
		return CommentProcessor.processComments(content);
	}

	/**
	 * Transforma imports para usar ctx.libs do NocoBase
	 * import { useState } from 'react' -> const { useState } = ctx.libs.React
	 */
	public static transformImports(content: string): string {
		const lines = content.split("\n");
		const transformedLines: string[] = [];

		// Extrai todos os imports usando ImportAnalyzer (robusto, baseado em AST)
		const allImports = ImportAnalyzer.extractImports(content);
		const libraries = new Map<string, Set<string>>();

		// Filtra e agrupa imports externos válidos
		for (const imp of allImports) {
			if (!imp.isExternal) continue;

			if (
				FileValidator.shouldIgnoreModule(imp.moduleName) ||
				FileValidator.isMockOrTestFile(imp.moduleName)
			) {
				continue;
			}

			if (!libraries.has(imp.moduleName)) {
				libraries.set(imp.moduleName, new Set());
			}

			imp.importedNames.forEach(name =>
				libraries.get(imp.moduleName)!.add(name),
			);
		}

		// Remove linhas de import originais
		for (const line of lines) {
			if (!line.trim().startsWith("import ")) {
				transformedLines.push(line);
			}
		}

		// Insere destructuring do ctx.libs
		if (libraries.size > 0) {
			const destructuringLines =
				LibraryMapper.generateAllDestructuring(libraries);
			const insertIndex = this.findInsertionPoint(transformedLines);
			transformedLines.splice(insertIndex, 0, ...destructuringLines, "");
		}

		return transformedLines.join("\n");
	}

	/**
	 * Encontra o ponto de inserção para o destructuring
	 */
	private static findInsertionPoint(lines: string[]): number {
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line.startsWith("//") && line !== "") {
				return i;
			}
		}
		return 0;
	}

	/**
	 * Verifica se um arquivo é de mock/test e deve ser ignorado
	 */
	public static shouldIgnoreFile(filePath: string): boolean {
		return FileValidator.isMockOrTestFile(filePath);
	}

	/**
	 * Verifica se um módulo deve ser ignorado
	 */
	public static shouldIgnoreModule(moduleName: string): boolean {
		return FileValidator.shouldIgnoreModule(moduleName);
	}

	/**
	 * Obtém a chave de biblioteca para o NocoBase ctx.libs
	 */
	public static getLibraryKey(moduleName: string): string {
		return LibraryMapper.getLibraryKey(moduleName);
	}

	/**
	 * Gera o cabeçalho do bundle NocoBase
	 */
	public static generateBundleHeader(): string {
		const now = new Date().toLocaleString("pt-BR");
		return `// Componente gerado pelo NocoBase Component Generator\n// Data: ${now}\n\n`;
	}

	/**
	 * Gera a renderização NocoBase (ctx.render)
	 */
	public static generateRender(
		componentName: string,
		defaultProps?: string | null,
	): string {
		return `\n\nctx.render(<${componentName} ${defaultProps ? `{...defaultProps}` : ""} />);`;
	}

	/**
	 * Gera export TypeScript (para bundles .tsx)
	 */
	public static generateExport(componentName: string): string {
		return `\n\nexport { ${componentName} };`;
	}
}
