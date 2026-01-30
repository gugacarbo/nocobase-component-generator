import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { LibraryMapper } from "../utils/LibraryMapper";
import { FileValidator } from "../utils/FileValidator";

/**
 * Adaptador para transformações específicas do NocoBase
 * Responsável por transformar código TypeScript/React em formato compatível com NocoBase
 */
export class NocoBaseAdapter {
	/**
	 * Transforma imports para usar ctx.libs do NocoBase
	 * import { useState } from 'react' -> const { useState } = ctx.libs.React
	 */
	public static transformImports(content: string): string {
		const lines = content.split("\n");
		const transformedLines: string[] = [];

		const allImports = ImportAnalyzer.extractImports(content);
		const libraries = new Map<string, Set<string>>();

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

		for (const line of lines) {
			if (!line.trim().startsWith("import ")) {
				transformedLines.push(line);
			}
		}

		if (libraries.size > 0) {
			const destructuringLines =
				LibraryMapper.generateAllDestructuring(libraries);
			const insertIndex = this.findInsertionPoint(transformedLines);
			transformedLines.splice(insertIndex, 0, ...destructuringLines, "");
		}

		return transformedLines.join("\n");
	}

	private static findInsertionPoint(lines: string[]): number {
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line.startsWith("//") && line !== "") {
				return i;
			}
		}
		return 0;
	}

	public static generateBundleHeader(): string {
		const now = new Date().toLocaleString("pt-BR");
		return `// Componente gerado pelo NocoBase Component Generator\n// Data: ${now}\n\n`;
	}

	public static generateRender(
		componentName: string,
		defaultProps?: string | null,
	): string {
		return `
		
		ctx.render(<${componentName} ${defaultProps ? `{...defaultProps}` : ""} />);
		
		// === === Components === ===
		 
		`;
	}

	public static generateExport(componentName: string): string {
		return `\n\nexport { ${componentName} };`;
	}
}
