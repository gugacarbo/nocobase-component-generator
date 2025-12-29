import { PlusOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { ctx } from "./ctx.mock";
import { useFieldsManager } from "./use-fields-manager";
import { FieldCard } from "./field-card";

function JsonFieldsCreator() {
	const { fields, addField, removeField, updateField, updateOptions } =
		useFieldsManager({ ctx });

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
						onUpdateOptions={updateOptions}
					/>
				))}

				<Button type="dashed" block icon={<PlusOutlined />} onClick={addField}>
					Adicionar Campo
				</Button>
			</Space>
		</div>
	);
}

export default JsonFieldsCreator;
