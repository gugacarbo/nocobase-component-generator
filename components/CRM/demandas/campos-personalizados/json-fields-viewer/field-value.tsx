import { Typography, Tag } from "antd";
import { CamposTipo } from "@components/CRM/@types";

const { Text, Paragraph } = Typography;

// Função para formatar telefone brasileiro
const formatPhoneNumber = (phone: string): string => {
	// Remove todos os caracteres não numéricos
	const cleaned = phone.replace(/\D/g, "");

	// Formatos brasileiros comuns
	if (cleaned.length === 11) {
		// Celular: (11) 99999-9999
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
	} else if (cleaned.length === 10) {
		// Fixo: (11) 9999-9999
		return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
	} else if (cleaned.length === 9) {
		// Celular sem DDD: 99999-9999
		return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
	} else if (cleaned.length === 8) {
		// Fixo sem DDD: 9999-9999
		return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
	}

	// Retorna o valor original se não conseguir formatar
	return phone;
};

interface FieldValueProps {
	campo: CamposTipo;
	value: any;
}

export function FieldValue({ campo, value }: FieldValueProps) {
	if (value === null || value === undefined || value === "") {
		return (
			<Text type="secondary" italic>
				Não preenchido
			</Text>
		);
	}

	switch (campo.type) {
		case "checkbox":
			return <Tag color={value ? "green" : "red"}>{value ? "Sim" : "Não"}</Tag>;

		case "checkbox-group":
			const checkboxValues = Array.isArray(value) ? value : [value];
			return (
				<div>
					{checkboxValues.map((item, index) => (
						<Tag key={index} style={{ marginBottom: 4 }}>
							{item}
						</Tag>
					))}
				</div>
			);

		case "radio":
			return <Tag color="blue">{String(value)}</Tag>;

		case "select":
			return <Tag color="geekblue">{String(value)}</Tag>;

		case "date":
			try {
				const d = new Date(value);
				if (!isNaN(d.getTime())) {
					return <Text>{d.toLocaleDateString("pt-BR")}</Text>;
				}
			} catch (e) {
				// fallthrough
			}
			return <Text>{String(value)}</Text>;

		case "textarea":
			return (
				<Paragraph style={{ margin: 0, whiteSpace: "pre-wrap" }}>
					{value}
				</Paragraph>
			);

		case "number":
			return <Text strong>{Number(value).toLocaleString("pt-BR")}</Text>;

		case "email":
			return <Text copyable={{ text: value }}>{value}</Text>;

		case "tel":
			const formattedPhone = formatPhoneNumber(String(value));
			return <Text copyable={{ text: value }}>{formattedPhone}</Text>;

		case "text":
		default:
			return <Text>{String(value)}</Text>;
	}
}
