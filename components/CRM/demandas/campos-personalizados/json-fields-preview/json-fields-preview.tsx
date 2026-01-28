import { ctx } from "./ctx.mock";

import { Button, Form } from "antd";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "@/nocobase/utils/useForm";
import FullDiv from "@components/CRM/ui/full-div";
import { FieldFormItem } from "../components/field-form-item";
import { useConditionalFields } from "../hooks/use-conditional-fields";
import { CamposTipo } from "@components/CRM/@types";

function getDefaultValue(field: CamposTipo): any {
	switch (field.type) {
		case "checkbox":
			return false;
		case "checkbox-group":
			return [];
		case "number":
			return null;
		case "select":
			return null;
		case "date":
			return null;
		default:
			return "";
	}
}

function JsonFieldsPreview() {
	const fields = ctx.value;
	const form = useForm();

	const [formData, setFormData] = useState<Record<string, any>>({});

	const { visibleFields } = useConditionalFields(fields ?? [], formData);

	// Inicializa valores padrão quando os campos mudam
	useEffect(() => {
		if (fields && fields.length > 0) {
			const initialValues: Record<string, any> = {};

			fields.forEach(field => {
				initialValues[field.name] = getDefaultValue(field);
			});

			setFormData(initialValues);
		}
	}, [fields]);

	const handleChange = useCallback((fieldName: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[fieldName]: value,
		}));
	}, []);

	if (!fields || Object.keys(fields).length === 0) {
		return null;
	}

	return (
		<FullDiv>
			<Form form={form} layout="vertical">
				<div style={{ display: "flex", flexDirection: "column" }}>
					{visibleFields?.map(field => (
						<FieldFormItem
							key={field.name}
							field={field}
							formData={formData}
							handleChange={handleChange}
						/>
					))}
				</div>
				<Button type="primary" htmlType="submit" style={{ marginTop: "1rem" }}>
					Testar Envio
				</Button>
			</Form>
		</FullDiv>
	);
}

export default JsonFieldsPreview;
