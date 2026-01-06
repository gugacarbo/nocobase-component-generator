import { Collapse } from "antd";
import { FieldCard } from "./field-card/field-card";
import { useFieldsManagerContext } from "./context/use-fields-manager";
import { CardHeader } from "./field-card/card-header/card-header";

function FieldsList() {
	const { fields, activeKeys, setActiveKeys } = useFieldsManagerContext();
	return (
		<Collapse
			ghost
			activeKey={activeKeys}
			onChange={setActiveKeys}
			style={{ width: "100%" }}
			items={fields.map((field, index) => ({
				key: field.name,
				label: <CardHeader field={field} index={index} />,
				children: <FieldCard key={index} field={field} index={index} />,
				forceRender: true,
			}))}
		/>
	);
}

export { FieldsList };
