import * as ts from "typescript";
import { APP_CONFIG } from "@/config/config";

/**
 * Cache para AST (Abstract Syntax Tree) parsing
 * Evita parsing redundante do mesmo conteúdo por múltiplos analisadores
 */
export class ASTCache {
	private static cache = new Map<string, ts.SourceFile>();

	/**
	 * Obtém ou cria um SourceFile do cache
	 */
	public static getSourceFile(
		content: string,
		fileName: string = APP_CONFIG.bundler.TEMP_FILE_NAME,
	): ts.SourceFile {
		const cacheKey = this.generateCacheKey(content, fileName);

		if (this.cache.has(cacheKey)) {
			return this.cache.get(cacheKey)!;
		}

		const sourceFile = ts.createSourceFile(
			fileName,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		this.cache.set(cacheKey, sourceFile);
		return sourceFile;
	}

	/**
	 * Limpa o cache
	 */
	public static clear(): void {
		this.cache.clear();
	}

	/**
	 * Gera uma chave de cache baseada em hash do conteúdo
	 */
	private static generateCacheKey(content: string, fileName: string): string {
		// Hash simples baseado em length + primeiro e último caracteres
		const hash =
			content.length +
			"-" +
			content.charCodeAt(0) +
			"-" +
			content.charCodeAt(content.length - 1) +
			"-" +
			fileName;
		return hash;
	}

	/**
	 * Retorna o tamanho atual do cache
	 */
	public static size(): number {
		return this.cache.size;
	}
}
