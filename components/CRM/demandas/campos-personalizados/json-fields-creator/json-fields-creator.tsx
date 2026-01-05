import { PlusOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { useFieldsManager } from "./use-fields-manager";
import { FieldCard } from "./field-card/field-card";
import { baseCtx as ctx } from "@/nocobase/ctx";

function JsonFieldsCreator() {
	const { fields, addField, removeField, updateField } = useFieldsManager(ctx);

	return (
		<div style={{ width: "100%" }}>
			<Typography.Title level={5}>Campos Personalizados: </Typography.Title>
			<div style={{ width: "100%", display: "grid", gap: 24 }}>
				{fields.map((field, index) => (
					<FieldCard
						key={index}
						field={field}
						index={index}
						onRemove={removeField}
						onUpdate={updateField}
					/>
				))}
				<Button block icon={<PlusOutlined />} onClick={addField} type="primary">
					Adicionar Campo
				</Button>
			</div>
		</div>
	);
}

export default JsonFieldsCreator;
