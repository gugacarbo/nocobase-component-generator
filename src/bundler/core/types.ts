/**
 * Informações sobre um arquivo processado
 */
export interface FileInfo {
	path: string;
	content: string;
	imports: string[];
	relativePath: string;
}

/**
 * Opções para geração do bundle
 */
export interface BundleOptions {
	isJavascript: boolean;
	outputFileName: string;
}

/**
 * Contexto compartilhado do pipeline de bundling
 * Reduz passagem redundante de parâmetros entre métodos
 */
export interface BundlePipelineContext {
	sortedFiles: string[];
	fileContents: Map<string, string>;
	files: Map<string, FileInfo>;
	mainComponent: string;
	externalImports: Map<string, Set<string>>;
}

/**
 * Contexto de carregamento de arquivos
 */
export interface FileLoadContext {
	files: Map<string, FileInfo>;
	firstFileRelativePath: string;
}

/**
 * Resultado do processo de bundling
 */
export interface BundleResult {
	content: string;
	fileCount: number;
	sizeKB: number;
	files: string[];
	mainComponent?: string;
}

/**
 * Informações sobre um import analisado
 */
export interface ImportInfo {
	moduleName: string;
	importedNames: string[];
	isExternal: boolean;
	isDefault: boolean;
	hasNamedImports: boolean;
	isTypeOnly?: boolean;
}

/**
 * Informações sobre re-export
 */
export interface ReExportInfo {
	exportedName: string;
	originalName: string;
	sourceModule: string;
	resolvedPath: string | null;
}

/**
 * Resultado da análise de declarações
 */
export interface DeclarationAnalysis {
	declared: Set<string>;
	used: Set<string>;
	unused: Set<string>;
}

/**
 * Opções de configuração do bundler
 */
export interface BundlerOptions {
	verbose?: boolean;
	exportTypescript?: boolean;
	skipTreeShaking?: boolean;
	skipFormatting?: boolean;
}
