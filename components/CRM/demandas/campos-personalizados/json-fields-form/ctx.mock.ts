import { baseCtx, CtxInterface } from "@/nocobase/ctx";
import { TipoDemandaPreset } from "@components/CRM/@types";
import { FormInstance } from "antd";
import { mockData } from "../mock-data";

let mockSelectedTypeId: number = 1;

// Função helper para obter os campos do tipo selecionado
const getFieldsForSelectedType = (): TipoDemandaPreset | null => {
	const selectedType = mockData.find(t => t.id === mockSelectedTypeId);
	return selectedType?.f_fk_tipo_preset || null;
};

const ctx: CtxInterface<TipoDemandaPreset | null> = {
	...baseCtx,
	render: (component: React.ReactNode) => component,
	getValue: () => getFieldsForSelectedType(),
	value: getFieldsForSelectedType(),
	setValue: (value: any) => {
		// mockFormData = value;
		console.log("Mock ctx.setValue called with:", value);
	},
	api: {
		request: <R = unknown>({
			url,
			method,
			params,
		}: any): Promise<{ data: { data: R } }> => {
			console.log("Mock API request:", { url, method, params });

			// Simular chamada para lista de tipos
			if (url === "t_demandas_tipos_v2:list") {
				return Promise.resolve({
					data: {
						data: mockData as R,
					},
				});
			}

			return Promise.resolve({ data: { data: [] as R } });
		},
	},
	element:
		typeof document !== "undefined"
			? document.createElement("span")
			: ({} as HTMLSpanElement),
	form: {} as FormInstance,
	model: { props: {} },
};

export { ctx };
