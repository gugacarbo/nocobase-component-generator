import { FilledFormData, TipoDemanda } from "@components/CRM/@types";

// Mock data para tipos de demanda
export const mockData: Pick<TipoDemanda, "id" | "f_fk_tipo_preset">[] = [
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

export const mockAnswersData = {
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

export const filledFieldsMockData: FilledFormData = {
	fieldsSnapshot: mockData[0].f_fk_tipo_preset?.f_campos,
	data: mockAnswersData,
};
