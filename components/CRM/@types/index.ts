import { Usuario as BaseUser } from "@components/@types/types";

export interface Usuario extends BaseUser {
	f_fk_setor_x_colaborador_v2: SetorDemanda[];
}

export interface Demanda {
	id: number;
	f_titulo_demanda: string;
	f_status: string;
	f_prioridade: "baixa" | "media" | "alta";
	f_tipo: TipoDemanda;
	f_demanda_setor: SetorDemanda;
}
export interface DemandaStatus {
	id: number;
	f_status: string;
	f_status_cor: string;
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
