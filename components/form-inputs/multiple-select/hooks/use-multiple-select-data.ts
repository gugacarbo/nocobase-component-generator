import { useEffect, useState } from "react";
import { baseCtx as ctx } from "@/nocobase/ctx";
import { SetorDemanda, Usuario } from "@components/CRM/@types";
import { FormInstance } from "antd";
import { OPTION_ID_KEY } from "../constants";

interface UseMultipleSelectDataResult {
	options: SetorDemanda[];
	loading: boolean;
	error: string | null;
}

export function useMultipleSelectData(
	fieldId: string,
	form?: FormInstance,
): UseMultipleSelectDataResult {
	const [options, setOptions] = useState<SetorDemanda[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			setError(null);

			try {
				const [userResponse, optionsResponse] = await Promise.all([
					ctx.api.request<Usuario>({
						url: `users:get/${ctx?.user?.id}`,
						method: "get",
						params: {
							appends: ["f_fk_setor_x_colaborador_v2"],
						},
					}),
					ctx.api.request<SetorDemanda>({
						url: "t_demandas_setor_v2:list",
						method: "get",
					}),
				]);

				const userData = userResponse?.data?.data;
				const fetchedUserIds =
					userData?.f_fk_setor_x_colaborador_v2?.map(setor => setor.id) ?? [];

				const optionsData = optionsResponse?.data?.data;

				if (!Array.isArray(optionsData)) {
					setError("Formato de dados de opções inválido");
					return;
				}
				setOptions(optionsData);

				if (optionsData.length > 0 && fetchedUserIds.length > 0 && form) {
					const currentFormValue = form.getFieldValue(fieldId);
					const isFieldEmpty =
						!currentFormValue ||
						(Array.isArray(currentFormValue) && currentFormValue.length === 0);

					if (isFieldEmpty) {
						const validInitialIds = fetchedUserIds.filter(id =>
							optionsData.some(option => option.id === id),
						);
						const initialSelectedOptions = optionsData.filter(option =>
							validInitialIds.includes(option.id),
						);

						form.setFieldValue(fieldId, initialSelectedOptions);
					}
				}
			} catch (err) {
				console.error("Erro ao buscar dados:", err);
				setError("Falha ao carregar dados.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [fieldId, form, ctx.api, ctx.user?.id]);

	return { options, loading, error };
}
