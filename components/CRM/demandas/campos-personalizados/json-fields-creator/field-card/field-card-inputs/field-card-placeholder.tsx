import { useForm } from "@/nocobase/utils/useForm";
import { Form, Input, Typography } from "antd";
import { Field } from "../../../types";

function FieldCardPlaceholder({
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
				name={`${field.name}-placeholder`}
				style={{ margin: 0 }}
				initialValue={field?.placeholder ?? ""}
				label={<Typography.Text strong>Placeholder</Typography.Text>}
			>
				<Input
					placeholder="Texto de ajuda"
					value={field.placeholder}
					onChange={e => onUpdate(index, "placeholder", e.target.value)}
				/>
			</Form.Item>
		</Form>
	);
}

export { FieldCardPlaceholder };
