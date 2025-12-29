import { useEffect, useState } from "react";
import { useUpdateFormValue } from "@/nocobase/hooks/use-update-form-value";
import { Field } from "./types";

interface UseFieldsManagerProps {
	ctx: any;
}

export function useFieldsManager({ ctx }: UseFieldsManagerProps) {
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
		setFields([
			...fields,
			{
				name: "",
				label: "",
				type: "text",
				required: false,
				placeholder: "",
				options: [],
			},
		]);
	};

	const removeField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
	};

	const updateField = (index: number, key: string, value: any) => {
		const newFields = [...fields];
		newFields[index] = { ...newFields[index], [key]: value };
		setFields(newFields);
	};

	const updateOptions = (index: number, optionsText: string) => {
		const options = optionsText
			.split(",")
			.map(opt => opt.trim())
			.filter(Boolean);
		updateField(index, "options", options);
	};

	return {
		fields,
		addField,
		removeField,
		updateField,
		updateOptions,
	};
}
