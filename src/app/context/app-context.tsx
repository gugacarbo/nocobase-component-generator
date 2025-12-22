import { createContext, useContext, useEffect, useState } from "react";
import { ComponentInfo } from "../types";
import { APP_CONFIG, removeComponentsPrefix } from "../config";

export const AppContext = createContext({
	config: {},
	components: [] as ComponentInfo[],
	selectedComponent: null as string | null,
	setSelectedComponent: (_: string | null) => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
	const config = {};

	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);

	useEffect(() => {
		const componentModules = Object.fromEntries(
			Object.entries(
				import.meta.glob("../../../**/*.{tsx,jsx}", {
					eager: false,
				}),
			).filter(([path]) =>
				path.startsWith("../../../" + APP_CONFIG.componentsPath),
			),
		);
		console.log({ componentModules });
		const foundComponents: ComponentInfo[] = Object.keys(componentModules).map(
			path => {
				const relativePath = removeComponentsPrefix(path);
				const extensionPattern = new RegExp(
					`\\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})$`,
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
		if (foundComponents.length > 0) {
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

export function useAppContext() {
	return useContext(AppContext);
}
