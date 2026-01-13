import { baseCtx, CtxInterface } from "@/nocobase/ctx";
import { TipoDemandaPreset } from "@components/CRM/@types";
import { mockData } from "../mock-data";

let mockSelectedTypeId: number = 1;

const getFieldsForSelectedType = (): TipoDemandaPreset["f_campos"] | null => {
	const selectedType = mockData.find(t => t.id === mockSelectedTypeId);
	return selectedType?.f_fk_tipo_preset?.f_campos || null;
};

const ctx: CtxInterface<TipoDemandaPreset["f_campos"] | null> = {
	...baseCtx,
	getValue: () => getFieldsForSelectedType(),
	value: getFieldsForSelectedType(),
};

export { ctx };
