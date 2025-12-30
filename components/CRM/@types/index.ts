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
