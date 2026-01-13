import { baseCtx, CtxInterface } from "@/nocobase/ctx";
import { filledFieldsMockData } from "../mock-data";
import { FilledFormData } from "@components/CRM/@types";

export const ctx: CtxInterface<FilledFormData> = {
	...baseCtx,
	value: JSON.stringify(filledFieldsMockData),
	getValue: () => JSON.stringify(filledFieldsMockData),
};
