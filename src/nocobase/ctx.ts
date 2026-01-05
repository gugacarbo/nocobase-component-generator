import { FormInstance } from "antd";

export interface CtxInterface<T = unknown> {
	render: (component: React.ReactNode) => React.ReactNode;
	getValue: () => T | null;
	value?: T | null;
	setValue: (value: any) => void;
	api: {
		request: <R = unknown>(options: any) => Promise<{ data: { data: R } }>;
	};
	element: HTMLSpanElement;
	form: FormInstance;
	model?: { props: {} };
	user?: {
		id: string;
		name: string;
	}
}

export const baseCtx: CtxInterface<unknown> = {
	render: (component: React.ReactNode) => component,
	getValue: () => null,
	setValue: (_: any) => { },
	value: null,
	api: {
		request: (_: any) => Promise.resolve({ data: { data: [] as any } }),
	},
	element: HTMLSpanElement.prototype,
	form: {} as FormInstance,
	model: { props: {} },
	user: {
		id: "1",
		name: "John Doe"
	}
};
