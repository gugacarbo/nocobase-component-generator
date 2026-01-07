import { baseCtx as ctx } from "@/nocobase/ctx";
import { defaultProps } from "./defaultProps";
import { Usuario } from "@components/CRM/@types";

const { userRelationKey, userRelationIdKey } = defaultProps;

async function getUserSelectedIds() {
	const userData = (
		await ctx.api.request<Usuario>({
			url: `users:get/${ctx.user?.id}`,
			method: "get",
			params: {
				appends: [userRelationKey],
			},
		})
	)?.data?.data;

	const userRelationData = userData?.[userRelationKey as keyof Usuario] || [];
	const userSelectedIds = Array.isArray(userRelationData)
		? userRelationData.map(item => item[userRelationIdKey as keyof typeof item])
		: [];

	return userSelectedIds;
}

export { getUserSelectedIds };
