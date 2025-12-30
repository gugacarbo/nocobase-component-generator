import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography } from "antd";

interface SelectOptionsEditorProps {
	options: string[];
	onChange: (options: string[]) => void;
}

export function SelectOptionsEditor({
	options,
	onChange,
}: SelectOptionsEditorProps) {
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
			<Space direction="vertical" style={{ width: "100%", marginTop: 8 }}>
				{options.map((option, optIndex) => (
					<Space.Compact key={optIndex} style={{ width: "100%" }}>
						<Input
							placeholder={`Opção ${optIndex + 1}`}
							value={option}
							onChange={e => handleOptionChange(optIndex, e.target.value)}
						/>
						<Button
							danger
							icon={<CloseOutlined />}
							onClick={() => handleRemoveOption(optIndex)}
						/>
					</Space.Compact>
				))}
				<Button
					type="dashed"
					block
					icon={<PlusOutlined />}
					onClick={handleAddOption}
				>
					Adicionar Opção
				</Button>
			</Space>
		</div>
	);
}
