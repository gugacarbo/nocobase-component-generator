import { useForm } from "@/nocobase/utils/useForm";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";

interface SelectOptionsEditorProps {
	options: string[];
	onChange: (options: string[]) => void;
	questionName: string;
}

export function SelectOptionsEditor({
	options,
	onChange,
	questionName,
}: SelectOptionsEditorProps) {
	const form = useForm();

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
					<Form.Item
						key={optIndex}
						name={`${questionName}-${optIndex}-title`}
						rules={[
							{
								required: true,
								message: "Este campo é obrigatório",
							},
						]}
						initialValue={option ?? ""}
					>
						<Space.Compact key={optIndex} style={{ width: "100%" }}>
							<Input
								placeholder={`Opção ${optIndex + 1}`}
								value={option}
								onChange={e => handleOptionChange(optIndex, e.target.value)}
							/>
							{options.length > 1 && (
								<Button
									danger
									icon={<CloseOutlined />}
									onClick={() => handleRemoveOption(optIndex)}
								/>
							)}
						</Space.Compact>
					</Form.Item>
				))}
			</Form>
			<Button
				type="default"
				block
				icon={<PlusOutlined />}
				onClick={handleAddOption}
			>
				Adicionar Opção
			</Button>
		</div>
	);
}
