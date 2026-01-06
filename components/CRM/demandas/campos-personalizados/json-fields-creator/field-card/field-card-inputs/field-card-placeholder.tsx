import { useForm } from "@/nocobase/utils/useForm";
import { Form, Input, Typography } from "antd";
import { useFieldsManagerContext } from "../../context/use-fields-manager";
import { useFieldContext } from "../field-context/field-context";

function FieldCardPlaceholder() {
	const form = useForm();
	const { updateField } = useFieldsManagerContext();
	const { field, index } = useFieldContext();

	return (
		<Form form={form} layout="vertical">
			<Form.Item
				key={field.name}
				name={`${field.name}-placeholder`}
				style={{ margin: 0 }}
				initialValue={field?.placeholder ?? ""}
				label={<Typography.Text strong>Placeholder</Typography.Text>}
			>
				<Input
					placeholder="Texto de ajuda"
					value={field.placeholder}
					onChange={e => updateField(index, "placeholder", e.target.value)}
				/>
			</Form.Item>
		</Form>
	);
}

export { FieldCardPlaceholder };
