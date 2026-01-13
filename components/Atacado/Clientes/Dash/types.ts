import { Cliente } from "@components/Atacado/@types";

export interface ClienteComProblemas extends Cliente {
	problemas: string[];
}
