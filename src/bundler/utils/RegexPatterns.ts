/**
 * Regex patterns usados pelo bundler
 */
export class RegexPatterns {
	/**
	 * Pattern para detectar declarações de import
	 * Captura: import { Named } from 'module'
	 *         import Default from 'module'
	 *         import * as Name from 'module'
	 */
	public static readonly IMPORT_STATEMENT =
		/import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"][^'"]+['"]\s*;?\n?/g;

	/**
	 * Pattern para detectar export default
	 */
	public static readonly EXPORT_DEFAULT = /^\s*export\s+default\s+\w+\s*;?\s*$/gm;

	/**
	 * Pattern para detectar export inline
	 */
	public static readonly EXPORT_INLINE = /export\s+default\s+/g;

	/**
	 * Pattern para detectar export named
	 */
	public static readonly EXPORT_NAMED =
		/export\s+(?=const|let|var|function|class|interface|type|enum)/g;

	/**
	 * Pattern para detectar export { ... }
	 */
	public static readonly EXPORT_BLOCK = /export\s*\{[^}]*\}\s*;?\n?/g;

	/**
	 * Pattern para remover comentários inline (preserva URLs)
	 */
	public static readonly INLINE_COMMENT = /([^:])\/\/.*$/;

	/**
	 * Pattern para detectar múltiplas linhas vazias
	 */
	public static readonly MULTIPLE_EMPTY_LINES = /\n\s*\n\s*\n/g;
}
