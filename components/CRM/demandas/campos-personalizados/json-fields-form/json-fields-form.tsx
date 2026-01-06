import { useUpdateFormValue } from "@nocobase/hooks/use-update-form-value";
import { useForm } from "@/nocobase/utils/useForm";
import { ctx } from "../ctx.mock";

import { useEffect, useState } from "react";
import { Form } from "antd";
import { renderField } from "../components/render-field";
import { getData } from "../get-data";
import { CamposTipo, TipoDemanda } from "@components/CRM/@types";

function JsonFieldsForm() {
	const value = ctx.getValue();
	const form = useForm();

	const [typesList, setTypesList] = useState<TipoDemanda[]>([]);
	const [fields, setFields] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});

	// Carregar tipos de demanda
	useEffect(() => {
		getData(ctx).then(setTypesList);
	}, []);

	// Atualizar campos quando o tipo de demanda mudar
	useEffect(() => {
		const nv = 1; //no-bundle
		//bundle-only: const nv = value
		if (typeof nv === "number") {
			const selectedType = typesList.find(type => type.id === nv);

			if (selectedType?.f_fk_tipo_preset?.f_campos) {
				const newFields = selectedType.f_fk_tipo_preset.f_campos;
				setFields(newFields);
			} else {
				setFields([]);
			}
		}
	}, [value, typesList]);

	// Carregar dados iniciais do formulário
	// useEffect(() => {
	// 	try {
	// 		const currentFormValue = ctx.getValue?.();
	// 		if (currentFormValue && typeof currentFormValue === "object") {
	// 			setFormData(currentFormValue.data || currentFormValue);
	// 			if (currentFormValue.fieldsSnapshot) {
	// 				setFieldsSnapshot(currentFormValue.fieldsSnapshot);
	// 			}
	// 		} else if (typeof currentFormValue === "string") {
	// 			const parsed = JSON.parse(currentFormValue);
	// 			setFormData(parsed.data || parsed);
	// 			if (parsed.fieldsSnapshot) {
	// 				setFieldsSnapshot(parsed.fieldsSnapshot);
	// 			}
	// 		}
	// 	} catch (error) {
	// 		console.error("Erro ao carregar dados iniciais:", error);
	// 	}
	// }, []);

	// Sincronizar com mudanças externas
	useUpdateFormValue((ev: Event) => {
		try {
			const customEvent = ev as CustomEvent;
			const newValue = customEvent?.detail ?? "{}";
			const parsed =
				typeof newValue === "string" ? JSON.parse(newValue) : newValue;
			const dataToSet = parsed.data || parsed;
			setFormData(
				typeof dataToSet === "object" && dataToSet !== null ? dataToSet : {},
			);
		} catch {
			setFormData({});
		}
	});

	// Salvar dados do formulário no banco com snapshot dos campos
	useEffect(() => {
		const dataToSave = {
			data: formData,
			fieldsSnapshot: fields,
		};
		ctx.setValue?.(dataToSave);
	}, [formData, fields]);

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

export default JsonFieldsForm;
