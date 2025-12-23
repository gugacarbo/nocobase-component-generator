/**
 * Utilitários para manipulação de strings e conversões
 */
export class StringUtils {
	/**
	 * Converte PascalCase/camelCase para kebab-case
	 */
	public static toKebabCase(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
			.toLowerCase();
	}

	/**
	 * Converte kebab-case para PascalCase
	 */
	public static toPascalCase(str: string): string {
		return str
			.split("-")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join("");
	}

	/**
	 * Converte kebab-case para camelCase
	 */
	public static toCamelCase(str: string): string {
		const pascal = this.toPascalCase(str);
		return pascal.charAt(0).toLowerCase() + pascal.slice(1);
	}

	/**
	 * Verifica se uma string é PascalCase (começa com maiúscula)
	 */
	public static isPascalCase(str: string): boolean {
		return str.length > 0 && str[0] === str[0].toUpperCase();
	}

	/**
	 * Remove prefixos de escopo de pacotes npm (@org/package -> package)
	 */
	public static removeNpmScope(packageName: string): string {
		return packageName.includes("/")
			? packageName.split("/").pop() || packageName
			: packageName;
	}

	/**
	 * Trunca uma string se for maior que o tamanho máximo
	 */
	public static truncate(str: string, maxLength: number): string {
		if (str.length <= maxLength) return str;
		return str.substring(0, maxLength - 3) + "...";
	}

	/**
	 * Indenta todas as linhas de uma string
	 */
	public static indent(str: string, spaces: number = 4): string {
		const indentation = " ".repeat(spaces);
		return str
			.split("\n")
			.map((line) => indentation + line)
			.join("\n");
	}

	/**
	 * Remove linhas vazias consecutivas (mais de 2)
	 */
	public static normalizeLineBreaks(str: string): string {
		return str.replace(/\n\s*\n\s*\n/g, "\n\n");
	}
}
