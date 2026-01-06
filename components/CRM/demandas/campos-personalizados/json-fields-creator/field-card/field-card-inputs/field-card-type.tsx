import { Form, Select, Typography } from "antd";
import { FIELD_TYPES, FIELD_TYPES_GROUPED } from "../../../constants";
import { useForm } from "@/nocobase/utils/useForm";
import { useFieldsManagerContext } from "../../context/use-fields-manager";
import { useFieldContext } from "../field-context/field-context";

function ItemRender({
	value,
	label,
}: {
	value?: any;
	label: React.ReactNode | string;
}) {
	return (
		<span>
			{FIELD_TYPES.find(type => type.value === value)?.icon}
			{"  "}
			{label}
		</span>
	);
}

function FieldCardType() {
	const form = useForm();
	const { updateField } = useFieldsManagerContext();
	const { field, index } = useFieldContext();

	return (
		<Form form={form} layout="vertical">
			<Form.Item
				key={field.name}
				name={`${field.name}-type`}
				rules={[
					{
						required: true,
						message: "Este campo é obrigatório",
					},
				]}
				initialValue={field?.type ?? ""}
				style={{ margin: 0 }}
				label={<Typography.Text strong>Tipo de Campo</Typography.Text>}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<Select
						style={{ width: "100%" }}
						value={field.type}
						onChange={value => updateField(index, "type", value)}
						options={FIELD_TYPES_GROUPED}
						labelRender={o => <ItemRender value={o.value} label={o.label} />}
						optionRender={o => <ItemRender value={o.value} label={o.label} />}
					/>
				</div>
			</Form.Item>
		</Form>
	);
}

export { FieldCardType };
