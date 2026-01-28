// Componente gerado pelo NocoBase Component Generator
// Data: 13/01/2026, 15:20:44

const { useEffect, useState } = ctx.libs.React;
const { Checkbox, Form, FormInstance, Input, Radio, Select, Switch } =
	ctx.libs.antd;

ctx.render(<JsonFieldsForm />);

// === === Components === ===

function useUpdateFormValue(handler) {
	useEffect(() => {
		if (!handler) return;
		ctx?.element?.addEventListener?.("js-field:value-change", handler);
		return () =>
			ctx?.element?.removeEventListener?.("js-field:value-change", handler);
	}, []);
}

function useForm() {
	const form = ctx.form;
	return form;
}

// Mock data para tipos de demanda
const mockData = [
	{
		id: 1,
		f_fk_tipo_preset: {
			f_campos: [
				{
					name: "titulo",
					label: "Título",
					type: "text",
					required: true,
					placeholder: "Digite o título",
				},
				{
					name: "descricao",
					label: "Descrição",
					type: "textarea",
					required: true,
					placeholder: "Digite a descrição",
				},
				{
					name: "prioridade",
					label: "Prioridade",
					type: "select",
					required: true,
					options: ["Baixa", "Média", "Alta", "Urgente"],
				},
				{
					name: "data_prevista",
					label: "Data Prevista",
					type: "date",
					required: true,
				},
				{
					name: "ativo",
					label: "Ativo",
					type: "checkbox",
					required: true,
				},
				{
					name: "interesses",
					label: "Interesses",
					type: "checkbox-group",
					required: true,
					options: ["Esportes", "Música", "Tecnologia", "Viagens"],
				},
				{
					name: "genero",
					label: "Gênero",
					type: "radio",
					required: true,
					options: ["Masculino", "Feminino", "Outro"],
				},
				{
					name: "idade",
					label: "Idade",
					type: "number",
					required: true,
					placeholder: "Digite a idade",
				},
				{
					name: "email",
					label: "E-mail",
					type: "email",
					required: true,
					placeholder: "Digite o e-mail",
				},
				{
					name: "telefone",
					label: "Telefone",
					type: "tel",
					required: true,
					placeholder: "Digite o telefone",
				},
			],
		},
	},
];
const mockAnswersData = {
	titulo: "Implementação de Sistema de Gestão de Vendas",
	email_contato: "cliente@empresa.com",
	telefone: "11999999999",
	descricao:
		"Desenvolvimento completo de um sistema de gestão de vendas com dashboard analítico, relatórios customizados e integração com sistemas externos.\n\nPrincipais funcionalidades:\n- Dashboard com métricas em tempo real\n- Gestão de clientes e produtos\n- Controle de estoque\n- Relatórios financeiros\n- API para integrações",
	prioridade: "Alta",
	tipo_projeto: "Desenvolvimento",
	data_prevista: "2026-03-15",
	orcamento: 75000,
	ativo: true,
	tecnologias: ["React", "TypeScript", "Node.js", "PostgreSQL"],
	observacoes:
		"Cliente solicitou entrega prioritária devido ao lançamento de produto no próximo trimestre. Equipe já alocada para o projeto.",
};

function renderField({ field, formData, handleChange }) {
	const { name, label, type, placeholder, options } = field;
	const fieldValue = formData[name] ?? "";
	const commonProps = {
		placeholder: placeholder || `Digite ${label?.toLowerCase()}`,
		value: fieldValue,
		style: { width: "100%" },
	};
	switch (type) {
		case "email":
			return (
				<Input
					type="email"
					{...commonProps}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);
		case "text":
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
				<Input
					type="date"
					style={{ width: "100%" }}
					placeholder={placeholder}
					value={fieldValue ?? null}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);
		case "checkbox":
			return (
				<Switch
					checked={fieldValue === true}
					onChange={checked => handleChange(name, checked)}
				/>
			);
		case "radio":
			return (
				<Radio.Group
					onChange={e => handleChange(name, e.target.value)}
					value={fieldValue}
					options={options?.map(opt => ({ label: opt, value: opt })) || []}
				/>
			);
		case "checkbox-group":
			return (
				<Checkbox.Group
					style={{ width: "100%" }}
					onChange={checkedValues => handleChange(name, checkedValues)}
					value={Array.isArray(fieldValue) ? fieldValue : []}
					options={options?.map(opt => ({ label: opt, value: opt })) || []}
				/>
			);
		default:
			return (
				<Input
					{...commonProps}
					onChange={e => handleChange(name, e.target.value)}
				/>
			);
	}
}

async function getData(ctx) {
	return (
		(
			await ctx.api.request({
				url: "t_demandas_tipos_v2:list",
				method: "get",
				params: {
					pageSize: 999,
					appends: ["f_fk_tipo_preset"],
				},
			})
		)?.data?.data ?? []
	);
}

// Validador de telefone brasileiro
function validatePhone(_, value) {
	if (!value) return Promise.resolve();
	const cleaned = value.replace(/\D/g, "");
	if (cleaned.length >= 8 && cleaned.length <= 11) {
		return Promise.resolve();
	}
	return Promise.reject(new Error("Telefone inválido"));
}
// Validador de número
function validateNumber(_, value) {
	if (!value) return Promise.resolve();
	if (isNaN(Number(value))) {
		return Promise.reject(new Error("Deve ser um número válido"));
	}
	return Promise.resolve();
}
// Retorna regras de validação baseadas no tipo do campo
function getFieldValidationRules(type, required = false) {
	const rules = [];
	if (required) {
		rules.push({
			required: true,
			message: "Este campo é obrigatório",
		});
	}
	switch (type) {
		case "email":
			rules.push({
				type: "email",
				message: "E-mail inválido",
			});
			break;
		case "tel":
			rules.push({
				validator: validatePhone,
			});
			break;
		case "number":
			rules.push({
				validator: validateNumber,
			});
			break;
		case "text":
			rules.push({
				whitespace: true,
				message: "Campo não pode conter apenas espaços",
			});
			break;
		case "textarea":
			rules.push({
				whitespace: true,
				message: "Campo não pode conter apenas espaços",
			});
			rules.push({
				max: 5000,
				message: "Máximo de 5000 caracteres",
			});
			break;
		case "select":
		case "radio":
			if (required) {
				rules.push({
					message: "Selecione uma opção",
				});
			}
			break;
		case "checkbox-group":
			if (required) {
				rules.push({
					type: "array",
					min: 1,
					message: "Selecione ao menos uma opção",
				});
			}
			break;
	}
	return rules;
}

function JsonFieldsForm() {
	const value = ctx.getValue();
	const form = useForm();
	const [typesList, setTypesList] = useState([]);
	const [fields, setFields] = useState([]);
	const [formData, setFormData] = useState({});
	useEffect(() => {
		getData(ctx).then(setTypesList);
	}, []);
	useEffect(() => {
		const nv = value;
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
	useUpdateFormValue(ev => {
		try {
			const customEvent = ev;
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
			data: formData,
			fieldsSnapshot: fields,
		};
		ctx.setValue?.(dataToSave);
	}, [formData, fields]);
	const handleChange = (fieldName, value) => {
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
						rules={getFieldValidationRules(
							field.type,
							field?.required ?? false,
						)}
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
