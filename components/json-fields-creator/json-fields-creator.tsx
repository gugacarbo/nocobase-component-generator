import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space, Card, Row, Col, Typography } from "antd";
import { ctx } from "./ctx.mock";
import { useEffect, useState } from "react";

function JsonFieldsCreator() {
	const [fields, setFields] = useState(() => {
		try {
			const currentValue = ctx.getValue?.() ?? "[]";
			const parsed =
				typeof currentValue === "string"
					? JSON.parse(currentValue)
					: currentValue;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	});

	// Sincronizar com mudanças externas
	useEffect(() => {
		const handler: EventListener = (ev: Event) => {
			try {
				const customEvent = ev as CustomEvent;
				const newValue = customEvent?.detail ?? "[]";
				const parsed =
					typeof newValue === "string" ? JSON.parse(newValue) : newValue;
				setFields(Array.isArray(parsed) ? parsed : []);
			} catch {
				setFields([]);
			}
		};
		//bundle-only: ctx.element?.addEventListener("js-field:value-change", handler);
		//bundle-only: return () =>ctx.element?.removeEventListener("js-field:value-change", handler);
	}, []);

	// Atualizar o valor no banco quando fields mudar
	useEffect(() => {
		ctx.setValue?.(fields);
	}, [fields]);

	const addField = () => {
		setFields([
			...fields,
			{
				name: "",
				label: "",
				type: "text",
				required: false,
				placeholder: "",
				options: [],
			},
		]);
	};

	const removeField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
	};

	const updateField = (index: number, key: string, value: any) => {
		const newFields = [...fields];
		newFields[index] = { ...newFields[index], [key]: value };
		setFields(newFields);
	};

	const updateOptions = (index: number, optionsText: string) => {
		// Converte texto separado por vírgula em array
		const options = optionsText
			.split(",")
			.map(opt => opt.trim())
			.filter(Boolean);
		updateField(index, "options", options);
	};

	const fieldTypes = [
		{ label: "Texto", value: "text" },
		{ label: "Número", value: "number" },
		{ label: "Email", value: "email" },
		{ label: "Telefone", value: "tel" },
		{ label: "Data", value: "date" },
		{ label: "Área de Texto", value: "textarea" },
		{ label: "Select", value: "select" },
		{ label: "Checkbox", value: "checkbox" },
	];

	return (
		<div style={{ width: "100%" }}>
			<Space orientation="vertical" style={{ width: "100%", display:"grid" }} size="middle">
				{fields.map((field, index) => (
					<Card
						key={index}
						size="small"
						title={`Campo ${index + 1}: ${field.label || "Sem nome"}`}
						extra={
							<Button
								type="text"
								danger
								icon={<DeleteOutlined />}
								onClick={() => removeField(index)}
							>
								Remover
							</Button>
						}
					>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Typography.Text>Nome do Campo (identificador)</Typography.Text>
								<Input
									placeholder="ex: nome_completo"
									value={field.name}
									onChange={e => updateField(index, "name", e.target.value)}
								/>
							</Col>

							<Col span={12}>
								<Typography.Text>Label (rótulo visível)</Typography.Text>
								<Input
									placeholder="ex: Nome Completo"
									value={field.label}
									onChange={e => updateField(index, "label", e.target.value)}
								/>
							</Col>

							<Col span={12}>
								<Typography.Text>Tipo de Campo</Typography.Text>
								<Select
									style={{ width: "100%" }}
									value={field.type}
									onChange={value => updateField(index, "type", value)}
									options={fieldTypes}
								/>
							</Col>

							<Col span={12}>
								<Typography.Text>Placeholder</Typography.Text>
								<Input
									placeholder="Texto de ajuda"
									value={field.placeholder}
									onChange={e =>
										updateField(index, "placeholder", e.target.value)
									}
								/>
							</Col>

							{field.type === "select" && (
								<Col span={24}>
									<Typography.Text>
										Opções (separadas por vírgula)
									</Typography.Text>
									<Input.TextArea
										placeholder="Opção 1, Opção 2, Opção 3"
										value={field.options?.join(", ") || ""}
										onChange={e => updateOptions(index, e.target.value)}
										rows={2}
									/>
								</Col>
							)}

							<Col span={24}>
								<Space>
									<input
										type="checkbox"
										checked={field.required}
										onChange={e =>
											updateField(index, "required", e.target.checked)
										}
									/>
									<Typography.Text>Campo obrigatório</Typography.Text>
								</Space>
							</Col>
						</Row>
					</Card>
				))}

				<Button type="dashed" block icon={<PlusOutlined />} onClick={addField}>
					Adicionar Campo
				</Button>

				{/* {fields.length > 0 && (
					<Card title="Preview JSON" size="small">
						<pre
							style={{
								background: "#f5f5f5",
								padding: "12px",
								borderRadius: "4px",
								overflow: "auto",
							}}
						>
							{JSON.stringify(fields, null, 2)}
						</pre>
					</Card>
				)} */}
			</Space>
		</div>
	);
}

export default JsonFieldsCreator;
