import { Switch, Typography } from "antd";
import { Field } from "../../../types";

function FieldCardRequired({
	field,
	onUpdate,
	index,
}: {
	field: Field;
	onUpdate: (index: number, key: string, value: any) => void;
	index: number;
}) {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				cursor: "default",
				marginTop: 6,
			}}
		>
			<label
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					gap: 8,
				}}
			>
				<Switch
					checked={field.required}
					onChange={checked => onUpdate(index, "required", checked)}
				/>
				<Typography.Text strong>Obrigatório</Typography.Text>
			</label>
		</div>
	);
}

export { FieldCardRequired };
