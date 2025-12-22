export const APP_CONFIG = {
	componentsPath: "components",
	supportedExtensions: [
		".tsx",
		//  ".jsx"
	] as const,

	// Endpoint da API para bundle
	bundleApiEndpoint: "/api/bundle",
} as const;

/**
 * Utilitário para remover o prefixo de componentes de um caminho
 */
export const removeComponentsPrefix = (path: string) => {
	return path.replace(`../../../${APP_CONFIG.componentsPath}/`, "");
};

/**
 * Utilitário para construir o caminho completo da API
 */
export const buildComponentApiPath = (relativePath: string) => {
	return `${APP_CONFIG.componentsPath}/${relativePath}`;
};
