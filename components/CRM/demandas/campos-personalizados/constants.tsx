import { FieldType } from "./types";

export const FIELD_TYPES_GROUPED: {
	label: React.ReactNode;
	title: string;
	options: FieldType[];
}[] = [
	{
		label: "Texto",
		title: "Texto",
		options: [
			{ label: "Texto", value: "text" },
			{ label: "Texto Longo", value: "textarea" },
			{ label: "Número", value: "number" },
			{ label: "Email", value: "email" },
			{ label: "Telefone", value: "tel" },
		],
	},
	{
		label: "Seletores",
		title: "Seletores",
		options: [
			{ label: "Data", value: "date" },
			{ label: "Select", value: "select" },
			{ label: "Radio", value: "radio" },
			{ label: "Checkbox (único)", value: "checkbox" },
			{ label: "Checkbox (múltiplo)", value: "checkbox-group" },
		],
	},
];

export const FIELD_TYPES: FieldType[] = FIELD_TYPES_GROUPED.flatMap(
	group => group.options,
);
