import { createContext, useContext, useEffect, useState } from "react";
import { ComponentInfo } from "../types";

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
		const componentModules = import.meta.glob(
			"../../../components/**/*.{tsx,jsx}",
			{
				eager: false,
			},
		);
		const foundComponents: ComponentInfo[] = Object.keys(componentModules).map(
			path => {
				const name = path
					.replace("../../../components/", "")
					.replace(/\.(tsx|jsx)$/, "");
				return {
					name,
					path,
					relativePath: path.replace("../../../components/", ""),
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
