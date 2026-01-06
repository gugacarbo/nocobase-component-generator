import { FieldsManagerContext } from "./context";
import { useEffect, useState } from "react";
import { useUpdateFormValue } from "@/nocobase/hooks/use-update-form-value";
import { Field } from "../../types";
import { baseCtx as ctx } from "@/nocobase/ctx";

interface FieldsManagerProviderProps {
	children: React.ReactNode;
}

export const FieldsManagerProvider = ({
	children,
}: FieldsManagerProviderProps) => {
	const [activeKeys, setActiveKeys] = useState<string[]>([]);

	const [fields, setFields] = useState<Field[]>(() => {
		try {
			const currentValue = ctx.getValue?.() ?? "[]";
			const parsed =
				typeof currentValue === "string"
					? JSON.parse(currentValue)
					: currentValue;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	});

	useUpdateFormValue((ev: Event) => {
		try {
			const customEvent = ev as CustomEvent;
			const newValue = customEvent?.detail ?? "[]";
			const parsed =
				typeof newValue === "string" ? JSON.parse(newValue) : newValue;
			setFields(Array.isArray(parsed) ? parsed : []);
		} catch {
			setFields([]);
		}
	});

	useEffect(() => {
		ctx.setValue?.(fields);
	}, [fields, ctx]);

	const addField = () => {
		const name = "field-" + Math.random().toString(36).substring(2, 9);
		setFields([
			...fields,
			{
				name,
				label: "",
				type: "text",
				required: false,
				placeholder: "",
				options: [""],
			},
		]);
		setActiveKeys([...activeKeys, name]);
	};

	const removeField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
	};

	const updateField = (index: number, key: string, value: any) => {
		const newFields = [...fields];
		newFields[index] = { ...newFields[index], [key]: value };
		setFields(newFields);
	};

	const toggleActiveKeys = () => {
		if (activeKeys.length > 0) {
			setActiveKeys([]);
		} else {
			setActiveKeys(fields.map(field => field.name));
		}
	};

	return (
		<FieldsManagerContext.Provider
			value={{
				fields,
				addField,
				setFields,
				removeField,
				updateField,
				activeKeys,
				setActiveKeys,
				toggleActiveKeys,
			}}
		>
			{children}
		</FieldsManagerContext.Provider>
	);
};
