import { DeleteOutlined } from "@ant-design/icons";
import {
	Button,
	Card,
	Col,
	Input,
	Row,
	Select,
	Typography,
	Switch,
} from "antd";
import { Field } from "../types";
import { FIELD_TYPES } from "../constants";
import { SelectOptionsEditor } from "./select-options-editor";

interface FieldCardProps {
	field: Field;
	index: number;
	onRemove: (index: number) => void;
	onUpdate: (index: number, key: string, value: any) => void;
}

export function FieldCard({
	field,
	index,
	onRemove,
	onUpdate,
}: FieldCardProps) {
	return (
		<Card
			size="small"
			title={
				<span>
					<b
						style={{
							color: "red",
							transition: "0.1s",
							opacity: field.required ? 1 : 0,
						}}
					>
						*{" "}
					</b>
					{`${field.label || "Sem nome"}`}
				</span>
			}
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
					<Typography.Text strong>Título</Typography.Text>
					<Input
						placeholder="ex: Nome Completo"
						value={field.label}
						onChange={e => onUpdate(index, "label", e.target.value)}
					/>
				</Col>

				<Col span={12}>
					<Typography.Text strong>Placeholder</Typography.Text>
					<Input
						placeholder="Texto de ajuda"
						value={field.placeholder}
						onChange={e => onUpdate(index, "placeholder", e.target.value)}
					/>
				</Col>

				<Col span={12}>
					<Typography.Text strong>Tipo de Campo</Typography.Text>
					<Select
						style={{ width: "100%" }}
						value={field.type}
						onChange={value => onUpdate(index, "type", value)}
						options={FIELD_TYPES}
					/>
				</Col>

				<Col
					span={12}
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 4,
						alignItems: "flex-start",
					}}
				>
					<Typography.Text strong>
						<b style={{ color: field.required ? "red" : "#999" }}>* </b>
						Campo obrigatório
					</Typography.Text>
					<Switch
						checked={field.required}
						onChange={checked => onUpdate(index, "required", checked)}
					/>
				</Col>

				{(field.type === "select" ||
					field.type === "radio" ||
					field.type === "checkbox-group") && (
					<Col span={24}>
						<SelectOptionsEditor
							options={field.options || []}
							onChange={(newOptions: string[]) =>
								onUpdate(index, "options", newOptions)
							}
						/>
					</Col>
				)}
			</Row>
		</Card>
	);
}
