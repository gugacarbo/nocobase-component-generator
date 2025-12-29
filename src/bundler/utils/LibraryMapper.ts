import { APP_CONFIG } from "@/config/config";

/**
 * Mapeia nomes de bibliotecas externas para as chaves do NocoBase ctx.libs
 */
export class LibraryMapper {
	/**
	 * Obtém a chave de biblioteca para o NocoBase ctx.libs
	 */
	public static getLibraryKey(moduleName: string): string {
		// Verifica mapeamentos especiais
		if (APP_CONFIG.bundler.LIBRARY_MAPPINGS[moduleName]) {
			return APP_CONFIG.bundler.LIBRARY_MAPPINGS[moduleName];
		}

		// Remove escopo se houver (@mui/material -> material)
		const withoutScope = moduleName.includes("/")
			? moduleName.split("/").pop() || moduleName
			: moduleName;

		// Converte kebab-case para PascalCase
		return this.toPascalCase(withoutScope);
	}

	/**
	 * Converte kebab-case para PascalCase
	 */
	private static toPascalCase(str: string): string {
		return str
			.split("-")
			.map(part => part.charAt(0).toUpperCase() + part.slice(1))
			.join("");
	}

	/**
	 * Gera múltiplas linhas de destructuring para várias bibliotecas
	 */
	public static generateAllDestructuring(
		libraries: Map<string, Set<string>>,
	): string[] {
		const lines: string[] = [];

		libraries.forEach((names, moduleName) => {
			const uniqueNames = [...new Set(names)];
			const libKey = this.getLibraryKey(moduleName);
			lines.push(`const { ${uniqueNames.join(", ")} } = ctx.libs.${libKey};`);
		});

		return lines;
	}
}
