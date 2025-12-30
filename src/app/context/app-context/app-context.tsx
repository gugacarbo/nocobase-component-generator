import { useEffect, useState } from "react";
import { ComponentInfo } from "../../types";
import { APP_CONFIG } from "@/config/config";
import { AppContext } from "./context";
import { PathUtils } from "@/bundler";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const config = {};

	const [currentPath, setCurrentPath] = useState<string[]>([]);
	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);

	// Atualiza selectedComponent na URL
	useEffect(() => {
		if (selectedComponent) {
			const relativePath = PathUtils.removeComponentsPrefix(selectedComponent);
			const extensionPattern = new RegExp(
				`\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})$`,
			);
			const pathWithoutExt = relativePath.replace(extensionPattern, "");
			const segments = pathWithoutExt.split("/");
			const file = segments[segments.length - 1];
			const dirs = segments.slice(0, -1).join("/");

			const newPath = dirs ? `/${dirs}/${file}` : `/${file}`;
			const url = new URL(window.location.origin + newPath);
			url.searchParams.set("file", file);
			window.history.replaceState({}, "", url.toString());
		}
	}, [selectedComponent]);

	// Carrega componentes e restaura selectedComponent da URL
	useEffect(() => {
		const componentModules = Object.fromEntries(
			Object.entries(
				import.meta.glob("../../../../**/*.{tsx,jsx}", {
					eager: false,
					import: "default",
				}),
			).filter(([path]) =>
				path.startsWith("../../../../" + APP_CONFIG.componentsPath),
			),
		);

		const loadComponents = async () => {
			const foundComponents: ComponentInfo[] = [];

			for (const [path, loader] of Object.entries(componentModules)) {
				try {
					const module = await loader();
					if (module) {
						const relativePath = PathUtils.removeComponentsPrefix(path);
						const extensionPattern = new RegExp(
							`\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})$`,
						);
						const name = relativePath.replace(extensionPattern, "");

						foundComponents.push({
							name,
							path,
							relativePath,
						});
					}
				} catch (error) {
					// Ignora arquivos que não têm export default ou com erro
				}
			}

			setComponents(foundComponents);

			// Restaura selectedComponent da URL, se existir
			const pathname = window.location.pathname;
			const urlFile = new URLSearchParams(window.location.search).get("file");

			if (pathname !== "/" && urlFile) {
				const pathSegments = pathname.split("/").filter(Boolean);
				const reconstructedPath = pathSegments.join("/");

				const matchingComponent = foundComponents.find(c => {
					const relativePath = PathUtils.removeComponentsPrefix(c.path);
					const extensionPattern = new RegExp(
						`\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})$`,
					);
					const pathWithoutExt = relativePath.replace(extensionPattern, "");
					return pathWithoutExt === reconstructedPath;
				});

				if (matchingComponent) {
					setSelectedComponent(matchingComponent.path);
				}
			}
		};

		loadComponents();
	}, []);

	return (
		<AppContext.Provider
			value={{
				config,
				components,
				selectedComponent,
				setSelectedComponent,
				currentPath,
				setCurrentPath,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
