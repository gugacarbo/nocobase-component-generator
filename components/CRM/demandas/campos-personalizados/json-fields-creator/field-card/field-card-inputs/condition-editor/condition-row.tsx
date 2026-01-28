import { Button, Select, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { FieldCondition, ConditionOperator, Field } from "../../../../types";
import { ValueInput } from "./value-input";
import { CONDITION_OPERATORS } from "@components/CRM/demandas/campos-personalizados/hooks/condition-constants";

interface ConditionRowProps {
	condition: FieldCondition;
	onChange: (condition: FieldCondition) => void;
	onRemove: () => void;
	availableFields: { label: string; value: string }[];
	allFields: Field[];
	canRemove: boolean;
}

export function ConditionRow({
	condition,
	onChange,
	onRemove,
	availableFields,
	allFields,
	canRemove,
}: ConditionRowProps) {
	const selectedOperator = CONDITION_OPERATORS.find(
		op => op.value === condition.operator,
	);
	const needsValue = selectedOperator?.needsValue ?? true;
	const targetField = allFields.find(f => f.name === condition.field);

	return (
		<Space.Compact style={{ width: "100%", marginBottom: 8 }}>
			<Select
				style={{ width: "35%" }}
				placeholder="Campo"
				value={condition.field || undefined}
				onChange={field => onChange({ ...condition, field, value: undefined })}
				options={availableFields}
			/>
			<Select
				style={{ width: "30%" }}
				placeholder="Operador"
				value={condition.operator}
				onChange={operator =>
					onChange({ ...condition, operator: operator as ConditionOperator })
				}
				options={CONDITION_OPERATORS.map(op => ({
					label: op.label,
					value: op.value,
				}))}
			/>
			{needsValue && (
				<div style={{ width: "25%" }}>
					<ValueInput
						targetField={targetField}
						value={condition.value}
						onChange={val => onChange({ ...condition, value: val })}
					/>
				</div>
			)}
			{canRemove && (
				<Button
					icon={<DeleteOutlined />}
					danger
					onClick={onRemove}
					style={{ width: needsValue ? "10%" : "35%" }}
				/>
			)}
		</Space.Compact>
	);
}
