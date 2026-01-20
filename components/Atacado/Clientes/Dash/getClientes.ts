import { baseCtx as ctx } from "@/nocobase/ctx";
import { Cliente } from "@components/Atacado/@types";

async function getClientes(parceiros: (string | number)[]): Promise<Cliente[]> {
	const res = await ctx.api.request<Cliente[]>({
		url: "t_clientes:list",
		method: "get",
		params: {
			pageSize: 99999,
			appends: ["f_parceiro"],
			filter: {
				f_fk_parceiro: parceiros,
			},
			fields: [
				"id",
				"f_cpf_cnpj",
				"f_nome_razao",
				"f_cidade",
				"f_cep",
				"f_endereco",
				"f_numero",
				"f_bairro",
				"f_uf",
			],
		},
	});
	return res.data?.data || [];
}

export { getClientes };
