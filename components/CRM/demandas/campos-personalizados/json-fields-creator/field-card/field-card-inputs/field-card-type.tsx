import { Form, Select, Typography } from "antd";
import { Field } from "../../../types";
import { FIELD_TYPES_GROUPED } from "../../../constants";
import { useForm } from "@/nocobase/utils/useForm";

function FieldCardType({
	field,
	index,
	onUpdate,
}: {
	field: Field;
	index: number;
	onUpdate: (index: number, key: string, value: any) => void;
}) {
	const form = useForm();
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
				<Select
					style={{ width: "100%" }}
					value={field.type}
					onChange={value => onUpdate(index, "type", value)}
					options={FIELD_TYPES_GROUPED}
				/>
			</Form.Item>
		</Form>
	);
}

export { FieldCardType };
