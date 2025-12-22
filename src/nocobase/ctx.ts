export const ctx = {
	render: (component: React.ReactNode) => component,
	getValue: () => undefined,
    setValue: (_: any) => {},
    api: {
        request: (_: any) => Promise.resolve({data: {data: []}}),
    },
    element: HTMLSpanElement.prototype,
};
