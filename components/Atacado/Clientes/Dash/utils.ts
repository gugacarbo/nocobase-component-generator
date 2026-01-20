import { Cliente } from "@components/Atacado/@types";
import { ClienteComProblemas } from "./types";

type Rule = {
	field: keyof Cliente;
	label: string;
	validator?: (cliente: ClienteComProblemas) => boolean;
};

export type GroupRule = {
	label: string;
	fields: Rule[];
	sortPriority?: number;
};

export const groupRules: GroupRule[] = [
	{
		label: "CPF/CNPJ",
		fields: [{ field: "f_cpf_cnpj", label: "CPF/CNPJ Não Informado" }],
		sortPriority: 1,
	},
	{
		label: "Dados Pessoais",
		fields: [
			{ field: "f_nome_razao", label: "Nome/Razão Social Não Informado" },
		],
		sortPriority: 2,
	},
	{
		label: "Endereço",
		fields: [
			{ field: "f_cidade", label: "Cidade" },
			{ field: "f_cep", label: "CEP" },
			{ field: "f_endereco", label: "Endereço" },
			{ field: "f_numero", label: "Número" },
			{ field: "f_bairro", label: "Bairro" },
			{ field: "f_uf", label: "UF" },
		],
	},
];

export function processarClientes(clientes: Cliente[]): ClienteComProblemas[] {
	return clientes
		.map(cliente => {
			const problemas: ClienteComProblemas["problemas"] = [];

			for (const group of groupRules) {
				const groupProblemas: string[] = [];
				for (const rule of group.fields) {
					const faltando = !cliente[rule.field];
					const invalido = rule.validator
						? rule.validator(cliente as ClienteComProblemas)
						: false;
					if (faltando || invalido) {
						groupProblemas.push(rule.label);
					}
				}
				if (groupProblemas.length > 0) {
					problemas.push([group.label, groupProblemas]);
				}
			}

			return {
				...cliente,
				problemas,
			};
		})
		.filter(cliente => cliente.problemas.length > 0);
}

export function calcularPorcentagemProblemas(
	total: number,
	comProblemas: number,
): string {
	return total > 0 ? ((comProblemas / total) * 100).toFixed(1) : "0";
}
