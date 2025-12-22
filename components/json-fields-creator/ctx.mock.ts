import { CtxInterface } from "@/nocobase/ctx";

// Mock data para tipos de demanda


const ctx: CtxInterface = {
	render: (component: React.ReactNode) => component,
	getValue: () => [],
	setValue: (value: any) => {
		// mockFormData = value;
		console.log("Mock ctx.setValue called with:", value);
	},
	api: {
		request: ({ url, method, params }: any) => {
			console.log("Mock API request:", { url, method, params });

			// Simular chamada para lista de tipos
			if (url === "t_demandas_tipos_v2:list") {
				return Promise.resolve({
					data: {
						data: [],
					},
				});
			}

			return Promise.resolve({ data: { data: [] } });
		},
	},
	element:
		typeof document !== "undefined"
			? document.createElement("span")
			: ({} as HTMLSpanElement),
};

export { ctx };
