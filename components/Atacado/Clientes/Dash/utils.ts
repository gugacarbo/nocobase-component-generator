import { Cliente } from "@components/Atacado/@types";
import { ClienteComProblemas } from "./types";

export function processarClientes(clientes: Cliente[]): ClienteComProblemas[] {
	return clientes
		.map(cliente => {
			const problemas: string[] = [];

			if (!cliente.f_cpf_cnpj || cliente.f_cpf_cnpj === "nan") {
				problemas.push("CPF/CNPJ");
			}
			if (!cliente.f_nome_razao || cliente.f_nome_razao === "nan") {
				problemas.push("Nome/Razão");
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
