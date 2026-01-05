import { useForm } from "@/nocobase/utils/useForm";
import { Form, Input, Typography } from "antd";
import { Field } from "../../../types";

function FieldCardTitle({
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
					onChange={e => onUpdate(index, "label", e.target.value)}
				/>
			</Form.Item>
		</Form>
	);
}

export { FieldCardTitle };
