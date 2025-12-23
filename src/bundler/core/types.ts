export interface BundlingOptions {
	exportTypescript: boolean;
}
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
	includeHeader?: boolean;
	minify?: boolean;
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
 * Estatísticas do bundle
 */
export interface BundleStatistics {
	totalFiles: number;
	totalLines: number;
	totalCharacters: number;
	sizeKB: number;
	imports: {
		external: number;
		internal: number;
	};
	components: number;
	unusedDeclarations: number;
}

/**
 * Pipeline de transformação
 */
export interface TransformationPipeline {
	name: string;
	enabled: boolean;
	transform: (content: string) => string | Promise<string>;
}
