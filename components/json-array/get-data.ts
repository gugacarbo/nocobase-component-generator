import { CtxInterface } from "@/nocobase/ctx";

export async function getData(ctx: CtxInterface) {
	return ctx.api.request({
		url: "t_demandas_tipos_v2:list",
		method: "get",
		params: {
			pageSize: 999,
			appends: ["f_fk_tipo_preset"],
		},
	});
}
