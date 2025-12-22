import { ctx } from "./ctx.mock";

import { Form } from "antd";
import { useEffect, useState } from "react";
import { CamposTipo, Tipo } from "./types";
import { renderField } from "./render-field";

function JsonArrayInput() {
	const value = ctx.getValue();

	const [typesList, setTypesList] = useState<Tipo[]>([]);
	const [fields, setFields] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});

	// Carregar tipos de demanda
	useEffect(() => {
		ctx.api
			.request({
				url: "t_demandas_tipos_v2:list",
				method: "get",
				params: {
					pageSize: 999,
					appends: ["f_fk_tipo_preset"],
				},
			})
			.then(response => {
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
	useEffect(() => {
		const handler: EventListener = (ev: Event) => {
			try {
				const customEvent = ev as CustomEvent;
				const newValue = customEvent?.detail ?? "{}";
				const parsed =
					typeof newValue === "string" ? JSON.parse(newValue) : newValue;
				setFormData(
					typeof parsed === "object" && parsed !== null ? parsed : {},
				);
			} catch {
				setFormData({});
			}
		};
		//bundle-only: ctx?.element?.addEventListener?.("js-field:value-change", handler);
		//bundle-only: return () =>ctx?.element?.removeEventListener?.("js-field:value-change", handler);
	}, []);

	// Salvar dados do formulário no banco
	useEffect(() => {
		ctx.setValue?.(formData);
	}, [formData]);

	const handleChange = (fieldName: string, value: any) => {
		setFormData(prev => ({
			...prev,
			[fieldName]: value,
		}));
	};

	if (!fields || fields.length === 0) {
		return null;
	}

	return (
		<div
			style={{
				width: "100%",
				display: "grid",
			}}
		>
			{fields.map((field, index) => (
				<Form.Item
					key={field.name || index}
					layout="vertical"
					label={
						<span style={{ fontWeight: "bold" }}>
							{field.label || field.name}
							{field.required && <span style={{ color: "red" }}> *</span>}
						</span>
					}
					required={field.required}
				>
					{renderField({
						field,
						handleChange,
						formData,
					})}
				</Form.Item>
			))}
		</div>
	);
}

export default JsonArrayInput;
