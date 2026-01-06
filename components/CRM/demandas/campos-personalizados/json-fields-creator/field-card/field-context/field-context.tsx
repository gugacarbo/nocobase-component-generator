import { createContext, useContext } from "react";
import { Field } from "../../../types";

export const FieldContext = createContext<
	| {
			index: number;
			field: Field;
	  }
	| undefined
>(undefined);

export function useFieldContext() {
	const context = useContext(FieldContext);

	if (context === undefined) {
		throw new Error("useFieldContext deve ser usado dentro de FieldProvider");
	}

	return context;
}
