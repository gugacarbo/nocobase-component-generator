import { DeleteOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Select,
	Space,
	Typography,
	Switch,
} from "antd";
import { Field } from "./types";
import { FIELD_TYPES } from "./constants";

interface FieldCardProps {
	field: Field;
	index: number;
	onRemove: (index: number) => void;
	onUpdate: (index: number, key: string, value: any) => void;
	onUpdateOptions: (index: number, optionsText: string) => void;
}

export function FieldCard({
	field,
	index,
	onRemove,
	onUpdate,
	onUpdateOptions,
}: FieldCardProps) {
	return (
		<Card
			size="small"
			title={`${field.label || "Sem nome"}`}
			extra={
				<Button
					type="text"
					danger
					icon={<DeleteOutlined />}
					onClick={() => onRemove(index)}
				>
					Remover
				</Button>
			}
		>
			<Row gutter={[16, 16]}>
				<Col span={12}>
					<Typography.Text>Nome do Campo (identificador)</Typography.Text>
					<Input
						placeholder="ex: nome_completo"
						value={field.name}
						onChange={e => onUpdate(index, "name", e.target.value)}
					/>
				</Col>

				<Col span={12}>
					<Typography.Text>Label (rótulo visível)</Typography.Text>
					<Input
						placeholder="ex: Nome Completo"
						value={field.label}
						onChange={e => onUpdate(index, "label", e.target.value)}
					/>
				</Col>

				<Col span={12}>
					<Typography.Text>Tipo de Campo</Typography.Text>
					<Select
						style={{ width: "100%" }}
						value={field.type}
						onChange={value => onUpdate(index, "type", value)}
						options={FIELD_TYPES}
					/>
				</Col>

				<Col span={12}>
					<Typography.Text>Placeholder</Typography.Text>
					<Input
						placeholder="Texto de ajuda"
						value={field.placeholder}
						onChange={e => onUpdate(index, "placeholder", e.target.value)}
					/>
				</Col>

				{field.type === "select" && (
					<Col span={24}>
						<Typography.Text>Opções (separadas por vírgula)</Typography.Text>
						<Input.TextArea
							placeholder="Opção 1, Opção 2, Opção 3"
							value={field.options?.join(", ") || ""}
							onChange={e => onUpdateOptions(index, e.target.value)}
							rows={2}
						/>
					</Col>
				)}

				<Col span={24}>
					<Space>
						<Switch
							checked={field.required}
							onChange={checked => onUpdate(index, "required", checked)}
						/>
						<Typography.Text>Campo obrigatório</Typography.Text>
					</Space>
				</Col>
			</Row>
		</Card>
	);
}
