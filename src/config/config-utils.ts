import { APP_CONFIG } from "./config";

export function removeComponentsPrefix(path: string) {
	return path.replace(`../../../../${APP_CONFIG.componentsPath}/`, "");
}

export function buildComponentApiPath(relativePath: string) {
	return `${APP_CONFIG.componentsPath}/${relativePath}`;
}
