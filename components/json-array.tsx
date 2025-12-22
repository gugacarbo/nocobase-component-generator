import { ctx } from "@/nocobase/ctx";

import {
	Input,
	Select,
	Checkbox,
	DatePicker,
	Form,
	Space,
	Typography,
} from "antd";

import { useEffect, useState } from "react";

type CamposTipo = {
	name: string;
	label: string;
	type: string;
	required?: boolean;
	placeholder?: string;
	options?: string[];
};
interface Tipo {
	id: number;
	f_fk_tipo_preset: {
		f_campos: CamposTipo[];
	} | null;
}

function JsonArray() {
	const [typesList, setTypesList] = useState<Tipo[]>([]);
	const [fields, setFields] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});

	const value = ctx.getValue();

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

	const renderField = (field: CamposTipo) => {
		const { name, label, type, placeholder, options } = field;
		const fieldValue = formData[name] ?? "";

		const commonProps = {
			placeholder: placeholder || `Digite ${label?.toLowerCase()}`,
			value: fieldValue,
			style: { width: "100%" },
		};

		switch (type) {
			case "text":
			case "email":
			case "tel":
				return (
					<Input
						{...commonProps}
						type={type}
						onChange={e => handleChange(name, e.target.value)}
					/>
				);

			case "number":
				return (
					<Input
						{...commonProps}
						type="number"
						onChange={e => handleChange(name, e.target.value)}
					/>
				);

			case "textarea":
				return (
					<Input.TextArea
						{...commonProps}
						rows={4}
						onChange={e => handleChange(name, e.target.value)}
					/>
				);

			case "select":
				return (
					<Select
						{...commonProps}
						onChange={val => handleChange(name, val)}
						options={options?.map(opt => ({ label: opt, value: opt })) || []}
					/>
				);

			case "date":
				return (
					<DatePicker
						style={{ width: "100%" }}
						placeholder={placeholder}
						value={fieldValue ? fieldValue : null}
						onChange={(_, dateString) => handleChange(name, dateString)}
					/>
				);

			case "checkbox":
				return (
					<Checkbox
						checked={fieldValue === true}
						onChange={e => handleChange(name, e.target.checked)}
					>
						{placeholder || label}
					</Checkbox>
				);

			default:
				return (
					<Input
						{...commonProps}
						onChange={e => handleChange(name, e.target.value)}
					/>
				);
		}
	};

	if (!fields || fields.length === 0) {
		return (
			<Typography.Text type="secondary">
				Nenhum campo configurado. Configure os campos primeiro.
			</Typography.Text>
		);
	}

	return (
		<Form layout="vertical">
			<Space direction="vertical" style={{ width: "100%" }} size="large">
				{fields.map((field, index) => (
					<Form.Item
						key={field.name || index}
						label={
							<span>
								{field.label || field.name}
								{field.required && <span style={{ color: "red" }}> *</span>}
							</span>
						}
						required={field.required}
					>
						{renderField(field)}
					</Form.Item>
				))}

				{/* Preview dos dados */}
				<Form.Item label="Dados Preenchidos (Preview)">
					<pre
						style={{
							background: "#f5f5f5",
							padding: "12px",
							borderRadius: "4px",
							fontSize: "12px",
						}}
					>
						{JSON.stringify(formData, null, 2)}
					</pre>
				</Form.Item>
			</Space>
		</Form>
	);
}

export default JsonArray;
