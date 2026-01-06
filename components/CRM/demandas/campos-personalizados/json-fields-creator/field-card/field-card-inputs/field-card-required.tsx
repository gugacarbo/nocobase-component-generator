import { Switch, Typography } from "antd";
import { useFieldsManagerContext } from "../../context/use-fields-manager";
import { useFieldContext } from "../field-context/field-context";

function FieldCardRequired() {
	const { updateField } = useFieldsManagerContext();
	const { field, index } = useFieldContext();

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
					onChange={checked => updateField(index, "required", checked)}
				/>
				<Typography.Text strong>Obrigatório</Typography.Text>
			</label>
		</div>
	);
}

export { FieldCardRequired };
