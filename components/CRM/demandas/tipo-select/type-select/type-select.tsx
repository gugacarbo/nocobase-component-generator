import { baseCtx as ctx } from "@/nocobase/ctx";
import { useUpdateFormValue } from "@/nocobase/hooks/use-update-form-value";
import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { getData } from "../get-tipos-data";

type Option = {
	label: string;
	value: number;
};

function TypeSelect() {
	const [value, setValue] = useState<number | null>(ctx.getValue?.() ?? null);
	const [options, setOptions] = useState<Option[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getData(ctx)
			.then(items => {
				setOptions(
					items.map(item => ({
						label: item.f_nome,
						value: item.id,
					})),
				);
			})
			.finally(() => setLoading(false));
	}, []);

	useUpdateFormValue(ev => {
		const customEvent = ev as CustomEvent;
		setValue(customEvent?.detail ?? "");
	});

	const handleChange = (val: number) => {
		setValue(val);
		ctx.setValue?.(val);
		ctx?.form?.setFieldValue("f_campos_preenchidos", val);
	};

	if (loading) return <Spin />;

	return (
		<Select
			{...ctx?.model?.props}
			style={{ width: "100%" }}
			placeholder="Selecione..."
			value={value}
			onChange={handleChange}
			options={options}
			showSearch
		/>
	);
}
export default TypeSelect;
