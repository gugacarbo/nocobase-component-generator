// Removido: duplicidade resolveAlias fora da classe
import * as path from "path";
import { APP_CONFIG } from "@/config/config";

/**
 * Utilitários para manipulação de caminhos de arquivos
 */
export class PathUtils {
	/**
	 * Resolve um importPath que usa alias para o caminho real do arquivo
	 */
	public static resolveAlias(importPath: string): string | null {
		const aliases = APP_CONFIG.aliases || {};
		for (const alias in aliases) {
			if (alias.endsWith("/*")) {
				const prefix = alias.replace(/\*+$/, "");
				if (importPath.startsWith(prefix)) {
					const aliasPaths = aliases[alias];
					for (const base of aliasPaths) {
						// Substitui o prefixo do alias pelo caminho real
						const subPath = importPath.substring(prefix.length);
						return this.normalize(base.replace(/\*+$/, "") + subPath);
					}
				}
			} else if (importPath === alias) {
				const aliasPaths = aliases[alias];
				for (const base of aliasPaths) {
					return this.normalize(base);
				}
			}
		}
		return null;
	}
	/**
	 * Normaliza um caminho para usar separadores Unix (/)
	 */
	public static normalize(filePath: string): string {
		return filePath.replace(/\\/g, "/");
	}

	/**
	 * Verifica se um importPath corresponde a algum alias configurado
	 */
	public static isAlias(importPath: string): boolean {
		const aliases = Object.keys(APP_CONFIG.aliases || {});
		return aliases.some(alias => {
			if (alias.endsWith("/*")) {
				const prefix = alias.replace(/\*+$/, "");
				return importPath.startsWith(prefix);
			} else {
				return importPath === alias;
			}
		});
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
		return segments.some(segment => normalized.includes(segment));
	}

	public static removeComponentsPrefix(path: string) {
		return path.replace(`../../../../${APP_CONFIG.componentsPath}/`, "");
	}

	public static buildComponentApiPath(relativePath: string) {
		return `${APP_CONFIG.componentsPath}/${relativePath}`;
	}
}
