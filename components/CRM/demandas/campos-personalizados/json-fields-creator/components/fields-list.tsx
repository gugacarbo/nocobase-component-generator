import { Collapse } from "antd";
import { FieldCard } from "../field-card/field-card";
import { CardTitle } from "../field-card/card-title";
import { DeleteFieldCard } from "../field-card/delete-field-card";
import { useFieldsManagerContext } from "../context/use-fields-manager";

function FieldsList() {
	const { fields, removeField, updateField, activeKeys, setActiveKeys } =
		useFieldsManagerContext();
	return (
		<Collapse
			ghost
			activeKey={activeKeys}
			onChange={setActiveKeys}
			style={{ width: "100%" }}
			items={fields.map((field, index) => ({
				key: field.name,
				label: (
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
						}}
					>
						<CardTitle field={field} />
						<DeleteFieldCard onRemove={() => removeField(index)} size="sm" />
					</div>
				),
				children: (
					<FieldCard
						key={index}
						field={field}
						index={index}
						onRemove={removeField}
						onUpdate={updateField}
					/>
				),
			}))}
		/>
	);
}

export { FieldsList };
