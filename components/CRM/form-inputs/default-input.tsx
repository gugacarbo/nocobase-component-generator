import { baseCtx as ctx } from "@/nocobase/ctx";
import { useUpdateFormValue } from "@/nocobase/hooks/use-update-form-value";
import { Input } from "antd";
import { ChangeEvent, useState } from "react";

function DefaultInput() {
	const [value, setValue] = useState(ctx.getValue() ?? "");

	useUpdateFormValue(ev => {
		const customEvent = ev as CustomEvent;
		setValue(customEvent?.detail ?? "");
	});

	const onChange = (e: ChangeEvent<HTMLInputElement>) => {
		const v = e?.target?.value ?? "";
		setValue(v);
		ctx.setValue?.(v);
	};

	return (
		<Input
			//bundle-only: {...ctx.model.props}
			value={value}
			onChange={onChange}
		/>
	);
}

export default DefaultInput;
