import * as path from "path";

/**
 * Utilitários para manipulação de caminhos de arquivos
 */
export class PathUtils {
	/**
	 * Normaliza um caminho para usar separadores Unix (/)
	 */
	public static normalize(filePath: string): string {
		return filePath.replace(/\\/g, "/");
	}

	/**
	 * Extrai o nome do arquivo sem extensão
	 */
	public static getFileNameWithoutExt(filePath: string): string {
		const baseName = path.basename(filePath);
		return baseName.replace(/\.[^.]+$/, "");
	}

	/**
	 * Verifica se um caminho é relativo
	 */
	public static isRelativePath(importPath: string): boolean {
		return (
			importPath.startsWith("./") ||
			importPath.startsWith("../") ||
			importPath.startsWith("/")
		);
	}

	/**
	 * Verifica se um caminho é de módulo externo (node_modules)
	 */
	public static isExternalModule(importPath: string): boolean {
		return !this.isRelativePath(importPath);
	}

	/**
	 * Obtém o caminho relativo entre dois diretórios
	 */
	public static getRelativePath(from: string, to: string): string {
		return this.normalize(path.relative(from, to));
	}

	/**
	 * Combina múltiplos segmentos de caminho
	 */
	public static join(...paths: string[]): string {
		return this.normalize(path.join(...paths));
	}

	/**
	 * Resolve um caminho absoluto
	 */
	public static resolve(...paths: string[]): string {
		return this.normalize(path.resolve(...paths));
	}

	/**
	 * Obtém o diretório de um caminho
	 */
	public static dirname(filePath: string): string {
		return this.normalize(path.dirname(filePath));
	}

	/**
	 * Verifica se um caminho contém algum dos segmentos fornecidos
	 */
	public static containsSegment(filePath: string, segments: string[]): boolean {
		const normalized = this.normalize(filePath);
		return segments.some((segment) => normalized.includes(segment));
	}
}
