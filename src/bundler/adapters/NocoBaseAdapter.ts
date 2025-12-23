export class NocoBaseAdapter {
	/** Mapeamento de módulos externos para chaves do NocoBase ctx.libs */
	private static readonly LIBRARY_MAPPINGS: Record<string, string> = {
		react: "React",
		"react-dom": "ReactDOM",
		antd: "antd",
		"@ant-design/icons": "antdIcons",
		"@formily/core": "formily",
		"@formily/react": "formily",
		"@nocobase/client": "nocobase",
		dayjs: "dayjs",
		lodash: "lodash",
	};

	/** Módulos que devem ser ignorados na transformação */
	private static readonly IGNORED_MODULES = [];

	/*[
	 * //[ Processa comentários bundle-only e remove outros comentários
	 * Linhas com //bundle-only: <code> são substituídas apenas pelo código
	 * //[Outros comentários inline e de bloco são removidos
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

					// Ignora imports do ctx (@/nocobase/ctx) e arquivos mock/test
					if (
						NocoBaseAdapter.shouldIgnoreModule(moduleName) ||
						NocoBaseAdapter.shouldIgnoreFile(moduleName)
					) {
						continue;
					}

					if (!libraries.has(moduleName)) {
						libraries.set(moduleName, new Set());
					}

					importedNames.forEach(name => libraries.get(moduleName)!.add(name));
				}
				continue; // Não adiciona a linha original
			}

			transformedLines.push(line);
		}

		// Segunda passagem: gera destructuring do ctx.libs
		if (libraries.size > 0) {
			const destructuringLines =
				NocoBaseAdapter.generateAllDestructuring(libraries);
			const insertIndex = this.findInsertionPoint(transformedLines);
			transformedLines.splice(insertIndex, 0, ...destructuringLines, "");
		}

		return transformedLines.join("\n");
	}

	/**
	 * Faz parse de uma linha de import
	 */
	private static parseImportLine(
		line: string,
	): { moduleName: string; importedNames: string[] } | null {
		const moduleMatch = line.match(/from\s+['"]([^'"]+)['"]/);
		if (!moduleMatch) return null;

		const moduleName = moduleMatch[1];
		const importedNames: string[] = [];

		// Tenta match completo: default + named
		const fullMatch = line.match(
			/import\s+(?:(\w+)|{([^}]+)}|(\w+),\s*{([^}]+)})\s+from/,
		);
		if (!fullMatch) return null;

		const [, defaultImport, namedImports, defaultWithNamed, namedWithDefault] =
			fullMatch;

		// Default import simples
		if (defaultImport) {
			importedNames.push(defaultImport);
		}

		// Default + Named
		if (defaultWithNamed) {
			importedNames.push(defaultWithNamed);
		}

		// Named imports
		const namedStr = namedImports || namedWithDefault;
		if (namedStr) {
			const names = namedStr
				.split(",")
				.map(n => n.trim())
				.filter(n => n);
			importedNames.push(...names);
		}

		return { moduleName, importedNames };
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

	// [ Verifica se um arquivo é de mock/test e deve ser ignorado ]
	public static shouldIgnoreFile(filePath: string): boolean {
		return /\.(mock|test|spec)\.(tsx?|jsx?)$/.test(filePath);
	}

	// [ Verifica se um módulo deve ser ignorado
	public static shouldIgnoreModule(moduleName: string): boolean {
		return this.IGNORED_MODULES.some(
			ignored => moduleName === ignored || moduleName.includes(ignored),
		);
	}

	//Obtém a chave de biblioteca para o NocoBase ctx.libs
	public static getLibraryKey(moduleName: string): string {
		// Verifica mapeamentos especiais
		if (this.LIBRARY_MAPPINGS[moduleName]) {
			return this.LIBRARY_MAPPINGS[moduleName];
		}

		// Remove escopo se houver (@mui/material -> material)
		const withoutScope = moduleName.includes("/")
			? moduleName.split("/").pop() || moduleName
			: moduleName;

		// Converte kebab-case para PascalCase
		return withoutScope
			.split("-")
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join("");
	}

	//Gera múltiplas linhas de destructuring para várias bibliotecas
	public static generateAllDestructuring(
		libraries: Map<string, Set<string>>,
	): string[] {
		const lines: string[] = [];

		libraries.forEach((names, moduleName) => {
			const uniqueNames = [...new Set(names)];
			const libKey = this.getLibraryKey(moduleName);
			lines.push(`const { ${uniqueNames.join(", ")} } = ctx.libs.${libKey};`);
		});

		return lines;
	}

	// [ Gera o cabeçalho do bundle NocoBase
	public static generateBundleHeader(): string {
		const now = new Date().toLocaleString("pt-BR");
		return `// Componente gerado pelo NocoBase Component Generator\n// Data: ${now}\n\n`;
	}

	// [ Gera a renderização NocoBase (ctx.render)
	public static generateRender(componentName: string): string {
		return `\n\nctx.render(<${componentName} />);`;
	}

	// [ Gera export TypeScript (para bundles .tsx)
	public static generateExport(componentName: string): string {
		return `\n\nexport { ${componentName} };`;
	}
}
