import { useEffect, useState } from "react";
import { Cliente, Usuario } from "@components/Atacado/@types";
import { getCurrentUser } from "@nocobase/getCurrentUser";
import { getClientes } from "./getClientes";
import { ClienteComProblemas } from "./types";
import { processarClientes } from "./utils";

export function useDashData() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<ClienteComProblemas[]>([]);
	const [allClientes, setAllClientes] = useState<Cliente[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [userData, setUserData] = useState<Usuario | null>(null);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			setError(null);
			try {
				const usr = await getCurrentUser({ appends: ["f_fk_parceiros"] });
				setUserData(usr);

				const clientes = await getClientes(
					usr.f_fk_parceiros?.map(p => (typeof p !== "string" ? p.id : p)),
				);

				setAllClientes(clientes);
				setData(processarClientes(clientes));
			} catch (error) {
				console.error("Error fetching data:", error);
				setError("Falha ao buscar dados. Tente novamente mais tarde.");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	return {
		loading,
		data,
		allClientes,
		error,
		userData,
	};
}
