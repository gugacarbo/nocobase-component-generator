import { useForm } from "@/nocobase/utils/useForm";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import { useFieldsManagerContext } from "../../../context/use-fields-manager";
import { useFieldContext } from "../../field-context/field-context";
import { AddOptionButton } from "./add-option-button";

export function SelectOptionsEditor() {
	const form = useForm();
	const { field, index } = useFieldContext();
	const { updateField } = useFieldsManagerContext();

	if (
		field.type !== "select" &&
		field.type !== "radio" &&
		field.type !== "checkbox-group"
	) {
		return null;
	}

	const options = field.options ?? [];

	const onChange = (newOptions: string[]) =>
		updateField(index, "options", newOptions);

	const handleOptionChange = (optIndex: number, value: string) => {
		const newOptions = [...options];
		newOptions[optIndex] = value;
		onChange(newOptions);
	};

	const handleRemoveOption = (optIndex: number) => {
		const newOptions = options.filter((_, i) => i !== optIndex);
		onChange(newOptions);
	};

	const handleAddOption = () => {
		onChange([...options, ""]);
	};

	return (
		<div>
			<Typography.Text strong>Opções</Typography.Text>
			<Form form={form} layout="vertical">
				{options.map((option, optIndex) => (
					<Space.Compact key={optIndex} style={{ width: "100%" }}>
						<Form.Item
							name={`${field.name}-${optIndex}-title`}
							rules={[
								{
									required: true,
									message: "Este campo é obrigatório",
								},
							]}
							initialValue={option ?? ""}
							style={{ width: "100%" }}
						>
							<Input
								placeholder={`Opção ${optIndex + 1}`}
								value={option}
								onChange={e => handleOptionChange(optIndex, e.target.value)}
							/>
						</Form.Item>
						{options.length > 1 && (
							<Button
								danger
								icon={<CloseOutlined />}
								onClick={() => handleRemoveOption(optIndex)}
							/>
						)}
					</Space.Compact>
				))}
			</Form>
			<AddOptionButton onClick={handleAddOption} />
		</div>
	);
}
