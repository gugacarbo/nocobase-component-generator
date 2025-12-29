import { CtxInterface } from "@/nocobase/ctx";
import { Tipo } from "@components/CRM/demandas/types";

export async function getData(ctx: CtxInterface) {
	return ctx.api.request<Tipo>({
		url: "t_demandas_tipos_v2:list",
		method: "get",
		params: {
			pageSize: 999,
			appends: ["f_fk_tipo_preset"],
		},
	});
}
