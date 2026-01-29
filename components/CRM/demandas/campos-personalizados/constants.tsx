import {
	AlignLeftOutlined,
	CalendarOutlined,
	CheckCircleOutlined,
	CheckSquareOutlined,
	FileTextOutlined,
	MailOutlined,
	NumberOutlined,
	PhoneOutlined,
	SwitcherOutlined,
	UnorderedListOutlined,
} from "@ant-design/icons";

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
			{
				label: "Texto",
				value: "text",
				icon: <AlignLeftOutlined />,
			},
			{
				label: "Texto Longo",
				value: "textarea",
				icon: <FileTextOutlined />,
			},
			{
				label: "Número",
				value: "number",
				icon: <NumberOutlined />,
			},
			{
				label: "Email",
				value: "email",
				icon: <MailOutlined />,
			},
			{
				label: "Telefone",
				value: "tel",
				icon: <PhoneOutlined />,
			},
		],
	},
	{
		label: "Seletores",
		title: "Seletores",
		options: [
			{
				label: "Data",
				value: "date",
				icon: <CalendarOutlined />,
			},
			{
				label: "Select",
				value: "select",
				icon: <UnorderedListOutlined />,
			},
			{
				label: "Radio",
				value: "radio",
				icon: <CheckCircleOutlined />,
			},
			{
				label: "Sim/Não",
				value: "checkbox",
				icon: <SwitcherOutlined />,
			},
			{
				label: "Checkbox (múltiplo)",
				value: "checkbox-group",
				icon: <CheckSquareOutlined />,
			},
		],
	},
];

export const FIELD_TYPES: FieldType[] = FIELD_TYPES_GROUPED.flatMap(
	group => group.options,
);
