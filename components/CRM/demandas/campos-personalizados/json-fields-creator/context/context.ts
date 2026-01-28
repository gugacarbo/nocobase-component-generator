import { createContext } from "react";
import { Field } from "../../types";

export interface FieldsManagerContextType {
	fields: Field[];
	setFields: React.Dispatch<React.SetStateAction<Field[]>>;
	activeKeys: string[];
	setActiveKeys: React.Dispatch<React.SetStateAction<string[]>>;
	addField: () => void;
	removeField: (index: number) => void;
	updateField: (index: number, key: string, value: any) => void;
	moveField: (index: number, direction: "up" | "down") => void;
	toggleActiveKeys: () => void;
}

export const FieldsManagerContext = createContext<
	FieldsManagerContextType | undefined
>(undefined);
