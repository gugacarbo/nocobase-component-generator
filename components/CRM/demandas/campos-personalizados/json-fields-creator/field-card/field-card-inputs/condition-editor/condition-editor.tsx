import { useState } from "react";
import { Button, Space, Typography, Card, Radio, Tooltip } from "antd";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useFieldsManagerContext } from "../../../context/use-fields-manager";
import { useFieldContext } from "../../field-context/field-context";
import {
	FieldCondition,
	ShowWhenCondition,
	ConditionOperator,
} from "../../../../types";
import { ConditionRow } from "./condition-row";

export function ConditionEditor() {
	const { fields, updateField } = useFieldsManagerContext();
	const { field, index } = useFieldContext();
	const [isExpanded, setIsExpanded] = useState(!!field.showWhen);

	const availableFields = fields
		.filter(f => f.name !== field.name && f.label)
		.map(f => ({
			label: f.label || f.name,
			value: f.name,
		}));

	const showWhen: ShowWhenCondition = field.showWhen || {
		conditions: [],
		logic: "and",
	};

	const updateShowWhen = (newShowWhen: ShowWhenCondition | undefined) => {
		updateField(index, "showWhen", newShowWhen);
	};

	const addCondition = () => {
		const newConditions = [
			...showWhen.conditions,
			{ field: "", operator: "equals" as ConditionOperator, value: "" },
		];
		updateShowWhen({ ...showWhen, conditions: newConditions });
	};

	const removeCondition = (condIndex: number) => {
		const newConditions = showWhen.conditions.filter((_, i) => i !== condIndex);
		if (newConditions.length === 0) {
			updateShowWhen(undefined);
			setIsExpanded(false);
		} else {
			updateShowWhen({ ...showWhen, conditions: newConditions });
		}
	};

	const updateCondition = (condIndex: number, condition: FieldCondition) => {
		const newConditions = [...showWhen.conditions];
		newConditions[condIndex] = condition;
		updateShowWhen({ ...showWhen, conditions: newConditions });
	};

	const toggleLogic = (logic: "and" | "or") => {
		updateShowWhen({ ...showWhen, logic });
	};

	if (availableFields.length === 0) {
		return null;
	}

	if (!isExpanded) {
		return (
			<Button
				type="dashed"
				size="small"
				icon={<PlusOutlined />}
				onClick={() => {
					setIsExpanded(true);
					addCondition();
				}}
			>
				Adicionar Condição
			</Button>
		);
	}

	return (
		<Card
			size="small"
			style={{ marginTop: 8, backgroundColor: "#fafafa" }}
			title={
				<Space>
					<Typography.Text strong style={{ fontSize: 12 }}>
						Mostrar este campo quando:
					</Typography.Text>
					<Tooltip title="Configure condições para exibir este campo apenas quando certas condições forem atendidas">
						<QuestionCircleOutlined style={{ color: "#999" }} />
					</Tooltip>
				</Space>
			}
			extra={
				<Button
					size="small"
					danger
					onClick={() => {
						updateShowWhen(undefined);
						setIsExpanded(false);
					}}
				>
					Remover Condições
				</Button>
			}
		>
			{showWhen.conditions.length > 1 && (
				<div style={{ marginBottom: 12 }}>
					<Typography.Text type="secondary" style={{ fontSize: 12 }}>
						Lógica:{" "}
					</Typography.Text>
					<Radio.Group
						size="small"
						value={showWhen.logic}
						onChange={e => toggleLogic(e.target.value)}
					>
						<Radio.Button value="and">Todas (E)</Radio.Button>
						<Radio.Button value="or">Qualquer (OU)</Radio.Button>
					</Radio.Group>
				</div>
			)}

			{showWhen.conditions.map((condition, condIndex) => (
				<ConditionRow
					key={condIndex}
					condition={condition}
					onChange={c => updateCondition(condIndex, c)}
					onRemove={() => removeCondition(condIndex)}
					availableFields={availableFields}
					allFields={fields}
					canRemove={showWhen.conditions.length > 1}
				/>
			))}

			<Button
				type="dashed"
				size="small"
				icon={<PlusOutlined />}
				onClick={addCondition}
				style={{ marginTop: 4 }}
			>
				Adicionar Condição
			</Button>
		</Card>
	);
}
