import { CtxInterface } from "@/nocobase/ctx";
import { TipoDemanda } from "@components/CRM/@types";

export async function getData(ctx: CtxInterface) {
	return (await ctx.api.request<TipoDemanda[]>({
		url: "t_demandas_tipos_v2:list",
		method: "get",
		params: {
			pageSize: 999,
			appends: ["f_fk_tipo_preset"],
		},
	}))?.data?.data ?? [];
}
