/**
 * Configurações centralizadas do bundler
 */
export class BundlerConfig {
	/** Arquivos excluídos do processo de bundling */
	public static readonly EXCLUDED_FILES = [
		"main.tsx",
		"App.tsx",
		"index.ts"
	];

	/** Diretórios excluídos do processo de bundling */
	public static readonly EXCLUDED_DIRS = [
		"node_modules",
		"output",
		"bundler",
		"dist",
		"build",
		".git",
	];

	/** Extensões de arquivo suportadas */
	public static readonly FILE_EXTENSIONS = /\.(tsx?|jsx?)$/;

	/** Extensões para resolução de imports */
	public static readonly IMPORT_EXTENSIONS = [
		".tsx",
		".ts",
		// ".jsx", ".js"
	];

	/** Configurações do Prettier para formatação */
	public static readonly PRETTIER_CONFIG = {
		parser: "typescript" as const,
		semi: true,
		singleQuote: false,
		tabWidth: 4,
		useTabs: false,
		trailingComma: "es5" as const,
		bracketSpacing: true,
		arrowParens: "avoid" as const,
		printWidth: 80,
		endOfLine: "lf" as const,
		jsxBracketSameLine: false,
	};

	/**
	 * Verifica se um arquivo deve ser excluído
	 */
	public static shouldExcludeFile(fileName: string): boolean {
		return this.EXCLUDED_FILES.some(excluded => fileName.includes(excluded));
	}

	/**
	 * Verifica se um diretório deve ser excluído
	 */
	public static shouldExcludeDir(dirPath: string): boolean {
		return this.EXCLUDED_DIRS.some(excluded => dirPath.includes(excluded));
	}

	/**
	 * Verifica se um arquivo tem extensão suportada
	 */
	public static isSupportedFile(fileName: string): boolean {
		return this.FILE_EXTENSIONS.test(fileName);
	}
}
