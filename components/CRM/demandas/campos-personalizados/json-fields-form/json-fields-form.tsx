import { useUpdateFormValue } from "@nocobase/hooks/use-update-form-value";
import { useForm } from "@/nocobase/utils/useForm";
import { ctx } from "./ctx.mock";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Form } from "antd";
import { FieldFormItem } from "../components/field-form-item";
import { getData } from "../get-data";
import { CamposTipo, TipoDemanda } from "@components/CRM/@types";
import { useConditionalFields } from "../hooks/use-conditional-fields";

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

function JsonFieldsForm() {
	const value = ctx.getValue();

	const form = useForm();

	const [typesList, setTypesList] = useState<TipoDemanda[]>([]);
	const [fields, setFields] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});

	const { visibleFields, getVisibleFieldNames } = useConditionalFields(
		fields,
		formData,
	);

	const filteredFormData = useMemo(() => {
		const result: Record<string, any> = {};
		for (const key of Object.keys(formData)) {
			if (getVisibleFieldNames.has(key)) {
				result[key] = formData[key];
			}
		}
		return result;
	}, [formData, getVisibleFieldNames]);

	const lastSavedData = useRef<string>("");

	useEffect(() => {
		getData(ctx).then(setTypesList);
	}, []);

	useEffect(() => {
		const nv = 1; //no-bundle
		//bundle-only: const nv = value
		if (typeof nv === "number") {
			const selectedType = typesList.find(type => type.id === nv);

			if (selectedType?.f_fk_tipo_preset?.f_campos) {
				const newFields = selectedType.f_fk_tipo_preset.f_campos;
				setFields(newFields);

				// Inicializa valores padrão para os campos novos
				setFormData(prevData => {
					const initialValues: Record<string, any> = {};

					newFields.forEach(field => {
						// Se o campo já tem valor, mantém; senão, define o valor padrão
						if (prevData[field.name] !== undefined) {
							initialValues[field.name] = prevData[field.name];
						} else {
							initialValues[field.name] = getDefaultValue(field);
						}
					});

					return initialValues;
				});
			} else {
				setFields([]);
				setFormData({});
			}
		}
	}, [value, typesList]);

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

	useEffect(() => {
		const dataToSave = {
			data: filteredFormData,
			fieldsSnapshot: fields,
		};

		const serialized = JSON.stringify(dataToSave);

		if (serialized !== lastSavedData.current) {
			lastSavedData.current = serialized;
			ctx.setValue?.(dataToSave);
		}
	}, [filteredFormData, fields]);

	const handleChange = useCallback(
		(fieldName: string, value: any) => {
			setFormData(prev => ({
				...prev,
				[fieldName]: value,
			}));
			form.setFieldValue(fieldName, value);
		},
		[form],
	);

	// Sincroniza valores padrão com o formulário Ant Design
	useEffect(() => {
		Object.entries(formData).forEach(([key, value]) => {
			if (form.getFieldValue(key) === undefined) {
				form.setFieldValue(key, value);
			}
		});
	}, [formData, form]);

	if (!fields || fields.length === 0) {
		return null;
	}

	return (
		<Form form={form} layout="vertical">
			<div style={{ display: "flex", flexDirection: "column" }}>
				{visibleFields.map(field => (
					<FieldFormItem
						key={field.name}
						field={field}
						formData={formData}
						handleChange={handleChange}
					/>
				))}
			</div>
		</Form>
	);
}

export default JsonFieldsForm;
