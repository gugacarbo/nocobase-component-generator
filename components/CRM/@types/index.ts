export interface Usuario {
	id: number;
	f_fk_setor_x_colaborador_v2: SetorDemanda[];
	email: string;
	phone: string;
	nickname: string;
	username: string;
	updatedById: number;
	createdById: number;
	createdAt: string;
	updatedAt: string;
}

export interface Demanda {
	id: number;
	f_titulo_demanda: string;
	f_status: string;
	f_prioridade: "baixa" | "media" | "alta";
	f_tipo: TipoDemanda;
	f_demanda_setor: SetorDemanda;
}

export interface SetorDemanda {
	id: number;
	f_setor: string;
	f_cor_setor: string;
	tipos: TipoDemanda[];
}

export interface TipoDemanda {
	id: number;
	f_sla: number;
	f_nome: string;
	f_cor: string;
	f_obrigatorio_anexo: boolean;
	updatedById: number;
	updatedAt: string;
	createdById: number;
	createdAt: string;
	f_fk_tipo_preset: {
		f_campos: CamposTipo[];
		f_descricao?: string;
	} | null;
}

export type CamposTipo = {
	name: string;
	label: string;
	type: string;
	required?: boolean;
	placeholder?: string;
	options?: string[];
};
