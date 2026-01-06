import { useContext } from "react";
import { AppContext } from "./context";

export function useAppContext() {
	const context = useContext(AppContext);

	if (context === undefined) {
		throw new Error("useAppContext deve ser usado dentro de AppProvider");
	}

	return context;
}
