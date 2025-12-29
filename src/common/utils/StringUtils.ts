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
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
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
}
