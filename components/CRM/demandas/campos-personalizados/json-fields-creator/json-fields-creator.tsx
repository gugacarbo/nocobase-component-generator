import { PlusOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { useFieldsManager } from "./use-fields-manager";
import { FieldCard } from "./field-card";
import { baseCtx as ctx } from "@/nocobase/ctx";

function JsonFieldsCreator() {
	const { fields, addField, removeField, updateField } = useFieldsManager({
		ctx,
	});

	return (
		<div style={{ width: "100%" }}>
			<Space
				orientation="vertical"
				style={{ width: "100%", display: "grid" }}
				size="middle"
			>
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
			</Space>
		</div>
	);
}

export default JsonFieldsCreator;
