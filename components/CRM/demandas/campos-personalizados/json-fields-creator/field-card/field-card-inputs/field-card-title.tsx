import { useForm } from "@/nocobase/utils/useForm";
import { Form, Input, Typography } from "antd";
import { useFieldsManagerContext } from "../../context/use-fields-manager";
import { useFieldContext } from "../field-context/field-context";

function FieldCardTitle() {
	const form = useForm();
	const { updateField } = useFieldsManagerContext();
	const { field, index } = useFieldContext();
	return (
		<Form form={form} layout="vertical">
			<Form.Item
				key={field.name}
				name={`${field.name}-title`}
				rules={[
					{
						required: true,
						message: "Este campo é obrigatório",
					},
				]}
				style={{ margin: 0 }}
				initialValue={field?.label ?? ""}
				label={<Typography.Text strong>Título</Typography.Text>}
			>
				<Input
					placeholder="ex: Nome Completo"
					value={field.label}
					onChange={e => updateField(index, "label", e.target.value)}
				/>
			</Form.Item>
		</Form>
	);
}

export { FieldCardTitle };
