import { Card, Col, Row } from "antd";
import { Field } from "../../types";
import { SelectOptionsEditor } from "./select-options-editor";
import { FieldCardRequired } from "./field-card-inputs/field-card-required";
import { FieldCardType } from "./field-card-inputs/field-card-type";
import { DeleteFieldCard } from "./delete-field-card";
import { CardTitle } from "./card-title";
import { FieldCardTitle } from "./field-card-inputs/field-card-title";
import { FieldCardPlaceholder } from "./field-card-inputs/field-card-placeholder";

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
			title={<CardTitle field={field} />}
			extra={<DeleteFieldCard onRemove={() => onRemove(index)} size="sm" />}
			actions={[
				<FieldCardRequired field={field} onUpdate={onUpdate} index={index} />,
				<DeleteFieldCard onRemove={() => onRemove(index)} />,
			]}
			style={{
				boxShadow: "0px 0px 4px -1px #999",
			}}
		>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<FieldCardTitle field={field} index={index} onUpdate={onUpdate} />
				</Col>
				<Col span={12}>
					<FieldCardType field={field} index={index} onUpdate={onUpdate} />
				</Col>
				<Col span={12}>
					<FieldCardPlaceholder
						field={field}
						index={index}
						onUpdate={onUpdate}
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
