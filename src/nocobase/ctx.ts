export interface CtxInterface {
	render: (component: React.ReactNode) => React.ReactNode;
	getValue: () => any;
	setValue: (value: any) => void;
	api: {
		request: (options: any) => Promise<any>;
	};
	element: HTMLSpanElement;
}

export const baseCtx: CtxInterface = {
	render: (component: React.ReactNode) => component,
	getValue: () => undefined,
	setValue: (_: any) => {},
	api: {
		request: (_: any) => Promise.resolve({ data: { data: [] } }),
	},
	element: HTMLSpanElement.prototype,
};
