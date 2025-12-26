import { useEffect, useState } from "react";
import { ComponentInfo } from "../../types";
import { APP_CONFIG } from "@/config/config";
import { AppContext } from "./context";
import { PathUtils } from "@/bundler";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const config = {};

	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);

	// Atualiza selectedComponent na URL
	useEffect(() => {
		if (selectedComponent) {
			const url = new URL(window.location.href);
			url.searchParams.set("component", selectedComponent);
			window.history.replaceState({}, "", url.toString());
		}
	}, [selectedComponent]);

	// Carrega componentes e restaura selectedComponent da URL
	useEffect(() => {
		const componentModules = Object.fromEntries(
			Object.entries(
				import.meta.glob("../../../../**/*.{tsx,jsx}", {
					eager: false,
				}),
			).filter(([path]) =>
				path.startsWith("../../../../" + APP_CONFIG.componentsPath),
			),
		);

		const foundComponents: ComponentInfo[] = Object.keys(componentModules).map(
			path => {
				const relativePath = PathUtils.removeComponentsPrefix(path);
				const extensionPattern = new RegExp(
					`\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})$`,
				);
				const name = relativePath.replace(extensionPattern, "");

				return {
					name,
					path,
					relativePath,
				};
			},
		);
		setComponents(foundComponents);

		// Restaura selectedComponent da URL, se existir
		const url = new URL(window.location.href);
		const urlComponent = url.searchParams.get("component");
		if (urlComponent && foundComponents.some(c => c.path === urlComponent)) {
			setSelectedComponent(urlComponent);
		} else if (foundComponents.length > 0) {
			setSelectedComponent(foundComponents[0].path);
		}
	}, []);

	return (
		<AppContext.Provider
			value={{
				config,
				components,
				selectedComponent,
				setSelectedComponent,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
