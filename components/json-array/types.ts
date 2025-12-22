export type CamposTipo = {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
};

export interface Tipo {
    id: number;
    f_fk_tipo_preset: {
        f_campos: CamposTipo[];
    } | null;
}