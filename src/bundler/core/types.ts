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
	mainComponent: string | null;
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
