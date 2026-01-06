import { useContext } from "react";
import { FieldsManagerContext } from "./context";

export function useFieldsManagerContext() {
	const context = useContext(FieldsManagerContext);

	if (context === undefined) {
		throw new Error(
			"useFieldsManagerContext deve ser usado dentro de FieldsManagerProvider",
		);
	}

	return context;
}
