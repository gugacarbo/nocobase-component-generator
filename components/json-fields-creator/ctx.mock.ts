import { CtxInterface } from "@/nocobase/ctx";

// Mock data para tipos de demanda
const mockTypesList = [
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


const ctx: CtxInterface = {
	render: (component: React.ReactNode) => component,
	getValue: () => [],
	setValue: (value: any) => {
		// mockFormData = value;
		console.log("Mock ctx.setValue called with:", value);
	},
	api: {
		request: ({ url, method, params }: any) => {
			console.log("Mock API request:", { url, method, params });

			// Simular chamada para lista de tipos
			if (url === "t_demandas_tipos_v2:list") {
				return Promise.resolve({
					data: {
						data: mockTypesList,
					},
				});
			}

			return Promise.resolve({ data: { data: [] } });
		},
	},
	element:
		typeof document !== "undefined"
			? document.createElement("span")
			: ({} as HTMLSpanElement),
};

export { ctx };
