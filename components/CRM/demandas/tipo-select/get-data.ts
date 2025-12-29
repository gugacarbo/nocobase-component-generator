import { CtxInterface } from "@/nocobase/ctx";
import { Tipo } from "../types";

export async function getData(ctx: CtxInterface) {
	return (
		(
			await ctx.api.request<Tipo>({
				url: "t_demandas_tipos_v2:list",
				params: {
					pageSize: 999,
					sort: ["f_nome"],
				},
			})
		)?.data?.data || []
	);
}
