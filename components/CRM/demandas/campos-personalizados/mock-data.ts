import { FilledFormData, TipoDemanda } from "@components/CRM/@types";

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
					name: "pessoa_juridica",
					label: "É Pessoa Jurídica?",
					type: "checkbox",
					required: false,
					placeholder: "",
				},
				{
					name: "cnpj",
					label: "CNPJ",
					type: "text",
					required: true,
					placeholder: "00.000.000/0000-00",
					showWhen: {
						conditions: [
							{ field: "pessoa_juridica", operator: "equals", value: true },
						],
						logic: "and",
					},
				},
				{
					name: "razao_social",
					label: "Razão Social",
					type: "text",
					required: true,
					placeholder: "Nome da empresa",
					showWhen: {
						conditions: [
							{ field: "pessoa_juridica", operator: "equals", value: true },
						],
						logic: "and",
					},
				},
				{
					name: "cpf",
					label: "CPF",
					type: "text",
					required: true,
					placeholder: "000.000.000-00",
					showWhen: {
						conditions: [
							{ field: "pessoa_juridica", operator: "notEquals", value: true },
						],
						logic: "and",
					},
				},
				{
					name: "nome_completo",
					label: "Nome Completo",
					type: "text",
					required: true,
					placeholder: "Nome da pessoa",
					showWhen: {
						conditions: [
							{ field: "pessoa_juridica", operator: "notEquals", value: true },
						],
						logic: "and",
					},
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
				{
					name: "prioridade_alta",
					label: "Detalhes da Urgência",
					type: "textarea",
					required: true,
					placeholder: "Descreva o motivo da urgência",
					showWhen: {
						conditions: [
							{ field: "prioridade", operator: "equals", value: "Urgente" },
						],
						logic: "and",
					},
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
	pessoa_juridica: false,
	cpf: "123.456.789-00",
	nome_completo: "João da Silva",
	interesses: ["React", "TypeScript", "Node.js", "PostgreSQL"],
	observacoes:
		"Cliente solicitou entrega prioritária devido ao lançamento de produto no próximo trimestre. Equipe já alocada para o projeto.",
};

export const filledFieldsMockData: FilledFormData = {
	fieldsSnapshot: mockData[0].f_fk_tipo_preset?.f_campos,
	data: mockAnswersData,
};
