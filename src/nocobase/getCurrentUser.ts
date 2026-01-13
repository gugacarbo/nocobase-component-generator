import { baseCtx as ctx } from "@/nocobase/ctx";
import { Usuario } from "@components/Atacado/@types";

export async function getCurrentUser({
	appends = [],
}: {
	appends?: string[];
} = {}): Promise<Usuario> {
	if (!ctx.user) {
		throw new Error("No user is currently logged in.");
	}
	const response = await ctx.api.request<Usuario>({
		url: "users:get",
		method: "get",
		params: {
			appends,
			filterByTk: ctx.user?.id,
		},
	});
	if (!response.data?.data) {
		throw new Error("Failed to fetch current user data.");
	}
	return response.data.data;
}
