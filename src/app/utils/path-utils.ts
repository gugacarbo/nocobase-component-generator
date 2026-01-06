import { APP_CONFIG } from "@/config/config";
import { PathUtils } from "@/bundler";

let extensionPatternCache: RegExp | null = null;

export function getExtensionPattern(): RegExp {
	if (!extensionPatternCache) {
		const extensions = APP_CONFIG.supportedExtensions
			.map(e => e.slice(1))
			.join("|");
		extensionPatternCache = new RegExp(`\\.(${extensions})$`);
	}
	return extensionPatternCache;
}

export function removeExtension(path: string): string {
	return path.replace(getExtensionPattern(), "");
}

export function getComponentPathInfo(path: string) {
	const relativePath = PathUtils.removeComponentsPrefix(path);
	const pathWithoutExt = removeExtension(relativePath);
	const segments = pathWithoutExt.split("/");
	const file = segments[segments.length - 1];
	const dirs = segments.slice(0, -1).join("/");

	return {
		relativePath,
		pathWithoutExt,
		file,
		dirs,
		urlPath: dirs ? `/${dirs}/${file}` : `/${file}`,
	};
}
