import { FormInstance } from "antd";

export interface CtxInterface {
	render: (component: React.ReactNode) => React.ReactNode;
	getValue: <T = unknown>() => T | null;
	setValue: (value: any) => void;
	api: {
		request: <T = unknown>(options: any) => Promise<{ data: { data: T[] } }>;
	};
	element: HTMLSpanElement;
	form: FormInstance;
	model?: { props: {} };
}

export const baseCtx: CtxInterface = {
	render: (component: React.ReactNode) => component,
	getValue: () => null,
	setValue: (_: any) => {},
	api: {
		request: (_: any) => Promise.resolve({ data: { data: [] } }),
	},
	element: HTMLSpanElement.prototype,
	form: {} as FormInstance,
	model: { props: {} },
};
