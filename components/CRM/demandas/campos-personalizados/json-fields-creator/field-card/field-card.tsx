import { Card, Col, Row } from "antd";
import { Field } from "../../types";
import { SelectOptionsEditor } from "./field-card-inputs/select-options-editor/select-options-editor";
import { FieldCardRequired } from "./field-card-inputs/field-card-required";
import { FieldCardType } from "./field-card-inputs/field-card-type";
import { FieldCardTitle } from "./field-card-inputs/field-card-title";
import { FieldCardPlaceholder } from "./field-card-inputs/field-card-placeholder";
import { ConditionEditor } from "./field-card-inputs/condition-editor/condition-editor";
import { DeleteFieldCard } from "../components/delete-field-card";
import { FieldContext } from "./field-context/field-context";

interface FieldCardProps {
	field: Field;
	index: number;
}

export function FieldCard({ field, index }: FieldCardProps) {
	return (
		<FieldContext.Provider value={{ index, field }}>
			<Card
				size="small"
				actions={[<FieldCardRequired />, <DeleteFieldCard index={index} />]}
				style={{
					boxShadow: "1px 1px 3px 0px #999",
				}}
			>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<FieldCardTitle />
					</Col>
					<Col span={12}>
						<FieldCardType />
					</Col>
					<Col span={12}>
						<FieldCardPlaceholder />
					</Col>
					<Col span={24}>
						<SelectOptionsEditor />
					</Col>
					<Col span={24}>
						<ConditionEditor />
					</Col>
				</Row>
			</Card>
		</FieldContext.Provider>
	);
}
