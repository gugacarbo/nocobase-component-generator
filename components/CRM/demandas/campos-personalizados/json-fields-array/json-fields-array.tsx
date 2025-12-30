import { useUpdateFormValue } from "@nocobase/hooks/use-update-form-value";
import { ctx } from "./ctx.mock";

import { Form } from "antd";
import { useEffect, useState } from "react";
import { renderField } from "./render-field";
import { getData } from "./get-data";
import { CamposTipo, TipoDemanda } from "@components/CRM/@types";

function JsonFieldsArray() {
	const value = ctx.getValue();
	const [form] = Form.useForm();

	const [typesList, setTypesList] = useState<TipoDemanda[]>([]);
	const [fields, setFields] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});

	// Carregar tipos de demanda
	useEffect(() => {
		getData(ctx).then(response => {
			setTypesList(response.data.data);
		});
	}, []);

	// Atualizar campos quando o tipo de demanda mudar
	useEffect(() => {
		if (typeof value === "number") {
			const selectedType = typesList.find(type => type.id === value);

			if (selectedType?.f_fk_tipo_preset?.f_campos) {
				setFields(selectedType.f_fk_tipo_preset.f_campos);
			} else {
				setFields([]);
			}
		}
	}, [value, typesList]);

	// Carregar dados iniciais do formulário
	useEffect(() => {
		try {
			const currentFormValue = ctx.getValue?.();
			if (currentFormValue && typeof currentFormValue === "object") {
				setFormData(currentFormValue);
			} else if (typeof currentFormValue === "string") {
				setFormData(JSON.parse(currentFormValue));
			}
		} catch (error) {
			console.error("Erro ao carregar dados iniciais:", error);
		}
	}, []);

	// Sincronizar com mudanças externas
	useUpdateFormValue((ev: Event) => {
		try {
			const customEvent = ev as CustomEvent;
			const newValue = customEvent?.detail ?? "{}";
			const parsed =
				typeof newValue === "string" ? JSON.parse(newValue) : newValue;
			setFormData(typeof parsed === "object" && parsed !== null ? parsed : {});
		} catch {
			setFormData({});
		}
	});

	// Salvar dados do formulário no banco
	useEffect(() => {
		ctx.setValue?.(formData);
	}, [formData]);

	const handleChange = (fieldName: string, value: any) => {
		const newFormData = {
			...formData,
			[fieldName]: value,
		};
		setFormData(newFormData);
		form.setFieldValue(fieldName, value);
	};

	if (!fields || fields.length === 0) {
		return null;
	}

	return (
		<Form form={form} layout="vertical">
			<div
				style={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				{fields.map((field, index) => (
					<Form.Item
						key={field?.name || index}
						name={field?.name}
						initialValue={formData[field?.name]}
						label={
							<span style={{ fontWeight: "bold" }}>
								{field.label || field?.name}
							</span>
						}
						rules={[
							{
								required: field?.required ?? false,
								message: "Este campo é obrigatório",
							},
						]}
					>
						{renderField({
							field,
							handleChange,
							formData,
						})}
					</Form.Item>
				))}
			</div>
		</Form>
	);
}

export default JsonFieldsArray;
