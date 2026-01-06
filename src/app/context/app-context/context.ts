import { createContext } from "react";
import { ComponentInfo } from "../../types";

export interface AppContextType {
	components: ComponentInfo[];
	selectedComponent: string | null;
	setSelectedComponent: (component: string | null) => void;
	currentPath: string[];
	setCurrentPath: (path: string[]) => void;
	isLoading: boolean;
	error: Error | null;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
