import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Collapse, Typography } from "antd";
import { useFieldsManager } from "./use-fields-manager";
import { FieldCard } from "./field-card/field-card";
import { baseCtx as ctx } from "@/nocobase/ctx";
import { CardTitle } from "./field-card/card-title";
import { DeleteFieldCard } from "./field-card/delete-field-card";

function JsonFieldsCreator() {
	const {
		fields,
		addField,
		removeField,
		updateField,
		activeKeys,
		setActiveKeys,
	} = useFieldsManager(ctx);

	return (
		<div style={{ width: "100%" }}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<Typography.Title level={5}>Campos Personalizados: </Typography.Title>
				{fields.length > 0 && (
					<Button
						style={{ marginRight: 8 }}
						onClick={() => {
							setActiveKeys(
								activeKeys.length === 0 ? fields.map(field => field.name) : [],
							);
						}}
						size="small"
					>
						{activeKeys.length === 0 ? "Expandir Tudo" : "Recolher Tudo"}
						<DownOutlined
							style={{
								transform:
									activeKeys.length === 0 ? "rotate(0deg)" : "rotate(180deg)",
								transition: "transform 0.2s",
							}}
						/>
					</Button>
				)}
			</div>
			<div style={{ width: "100%", display: "grid", gap: 24 }}>
				<Collapse
					activeKey={activeKeys}
					onChange={keys => setActiveKeys(keys)}
					bordered={false}
					ghost
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
								<DeleteFieldCard
									onRemove={() => removeField(index)}
									size="sm"
								/>
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

				<Button block icon={<PlusOutlined />} onClick={addField} type="primary">
					Adicionar Campo
				</Button>
			</div>
		</div>
	);
}

export default JsonFieldsCreator;
