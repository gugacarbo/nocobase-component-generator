import { CtxInterface } from "@/nocobase/ctx";
import { CamposTipo, TipoDemanda } from "@components/CRM/@types";
import { FormInstance } from "antd";

// Mock data para tipos de demanda
const mockTypesList: Pick<TipoDemanda, "id" | "f_fk_tipo_preset">[] = [
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
					required: false,
				},
				{
					name: "ativo",
					label: "Ativo",
					type: "checkbox",
					required: false,
				},
				{
					name: "interesses",
					label: "Interesses",
					type: "checkbox-group",
					required: false,
					options: ["Esportes", "Música", "Tecnologia", "Viagens"],
				},
				{
					name: "genero",
					label: "Gênero",
					type: "radio",
					required: false,
					options: ["Masculino", "Feminino", "Outro"],
				},
				{
					name: "idade",
					label: "Idade",
					type: "number",
					required: false,
					placeholder: "Digite a idade",
				},
				{
					name: "email",
					label: "E-mail",
					type: "email",
					required: false,
					placeholder: "Digite o e-mail",
				},
				{
					name: "telefone",
					label: "Telefone",
					type: "tel",
					required: false,
					placeholder: "Digite o telefone",
				},
			],
		},
	},
	{
		id: 2,
		f_fk_tipo_preset: {
			f_campos: [
				{
					name: "nome_cliente",
					label: "Nome do Cliente",
					type: "text",
					required: true,
				},
				{
					name: "telefone",
					label: "Telefone",
					type: "text",
					required: true,
				},
				{
					name: "email",
					label: "E-mail",
					type: "text",
					required: false,
				},
			],
		},
	},
];

let mockSelectedTypeId: number = 1;

// Função helper para obter os campos do tipo selecionado
const getFieldsForSelectedType = (): CamposTipo[] => {
	const selectedType = mockTypesList.find(t => t.id === mockSelectedTypeId);
	return selectedType?.f_fk_tipo_preset?.f_campos || [];
};

const ctx: CtxInterface<CamposTipo[] | null> = {
	render: (component: React.ReactNode) => component,
	getValue: () => getFieldsForSelectedType(),
	value: getFieldsForSelectedType(),
	setValue: (value: any) => {
		// mockFormData = value;
		console.log("Mock ctx.setValue called with:", value);
	},
	api: {
		request: <R = unknown>({
			url,
			method,
			params,
		}: any): Promise<{ data: { data: R } }> => {
			console.log("Mock API request:", { url, method, params });

			// Simular chamada para lista de tipos
			if (url === "t_demandas_tipos_v2:list") {
				return Promise.resolve({
					data: {
						data: mockTypesList as R,
					},
				});
			}

			return Promise.resolve({ data: { data: [] as R } });
		},
	},
	element:
		typeof document !== "undefined"
			? document.createElement("span")
			: ({} as HTMLSpanElement),
	form: {} as FormInstance,
	model: { props: {} },
};

export { ctx };
