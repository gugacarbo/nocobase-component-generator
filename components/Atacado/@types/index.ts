import { Usuario as BaseUser } from "@components/@types/types";

export interface Usuario extends BaseUser {
	f_fk_parceiros: Parceiro[] | string[];
}

export interface Parceiro {
	id: number;
	f_id_asaas: string;

	f_razao_social: string;
	f_cnpj: string;
	f_fantasia: string;

	f_email_faturamento: string;
	f_ip_encaminhamento: string;
	f_contratossippulse: string;

	f_cidade: string;
	f_endereco: string;
	f_cep: string;

	f_data_vencimento: string;
	f_uf: string;
	f_bairro: string;
	f_numero: string;
	f_telefone: number;

	f_fk_usuarios: string;
	f_fk_planos_servico: string;

	updatedAt: string;
	createdAt: string;
	updatedById: number;
	createdById: number;
}

export interface Cliente {
	id: number;

	f_nome_razao: string;
	f_cpf_cnpj: string;
	f_fantasia: string;
	f_email: string;

	f_codigo_area_local: string;
	f_area_local: string;
	f_telefone: string;
	f_codigo_cnl: string;

	f_cidade: string;
	f_cep: string;
	f_endereco: string;
	f_numero: string;
	f_bairro: string;
	f_uf: string;

	f_fk_servicos_adicionais: string;
	f_fk_parceiro: number;

	updatedAt: string;
	createdAt: string;
	updatedById: number;
	createdById: number;
}
