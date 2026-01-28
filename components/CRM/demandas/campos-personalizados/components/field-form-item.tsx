import { Form } from "antd";
import { CamposTipo } from "@components/CRM/@types";
import { renderField } from "./render-field";
import { getFieldValidationRules } from "../validation-rules";

interface FieldFormItemProps {
	field: CamposTipo;
	formData: Record<string, any>;
	handleChange: (fieldName: string, value: any) => void;
}

export function FieldFormItem({
	field,
	formData,
	handleChange,
}: FieldFormItemProps) {
	return (
		<Form.Item
			key={field.name}
			name={field.name}
			initialValue={formData[field.name]}
			label={
				<span style={{ fontWeight: "bold" }}>{field.label || field.name}</span>
			}
			rules={getFieldValidationRules(field.type, field?.required ?? false)}
		>
			{renderField({
				field,
				handleChange,
				formData,
			})}
		</Form.Item>
	);
}
