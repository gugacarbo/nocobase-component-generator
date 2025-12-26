import { createContext } from "react";
import { ComponentInfo } from "../../types";

export const AppContext = createContext({
	config: {},
	components: [] as ComponentInfo[],
	selectedComponent: null as string | null,
	setSelectedComponent: (_: string | null) => {},
});
