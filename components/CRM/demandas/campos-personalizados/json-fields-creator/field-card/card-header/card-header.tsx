import { Field } from "../../../types";
import { DeleteFieldCard } from "../../components/delete-field-card";
import { Typography, Tag, Tooltip, Button } from "antd";
import { useForm } from "@/nocobase/utils/useForm";
import { FIELD_TYPES } from "../../../constants";
import {
	EyeOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
} from "@ant-design/icons";
import { useFieldsManagerContext } from "../../context/use-fields-manager";

function CardHeader({ field, index }: { field: Field; index: number }) {
	const form = useForm();
	const { fields, moveField } = useFieldsManagerContext();
	const hasConditions =
		field.showWhen?.conditions && field.showWhen.conditions.length > 0;

	const isFirst = index === 0;
	const isLast = index === fields.length - 1;

	const errors = form
		.getFieldsError()
		.filter(err => err.name[0].toString().includes(field.name))
		.map(err => err.errors)
		.flat();

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				width: "100%",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<Typography.Title level={5} style={{ margin: 0 }}>
						{FIELD_TYPES?.find(t => t.value === field.type)?.icon || ""}{" "}
						<b
							style={{
								color: "red",
								transition: "0.1s",
								opacity: field.required ? 1 : 0,
							}}
						>
							*
						</b>
						{`${field.label || "Sem nome"}`}
					</Typography.Title>
					{hasConditions && (
						<Tooltip title="Este campo possui condições de exibição">
							<Tag
								color="blue"
								style={{ marginLeft: 4, fontSize: 10, padding: "0 4px" }}
							>
								<EyeOutlined /> Condicional
							</Tag>
						</Tooltip>
					)}
				</div>
				{JSON.stringify(errors) !== "[]" && (
					<Typography.Text style={{ color: "red", marginRight: 8 }}>
						{errors.join(", ")}
					</Typography.Text>
				)}
			</div>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<Button
					type="dashed"
					size="small"
					icon={<ArrowUpOutlined />}
					onClick={e => {
						e.stopPropagation();
						moveField(index, "up");
					}}
					disabled={isFirst}
					style={{ opacity: isFirst ? 0.3 : 1 }}
				/>
				<Button
					type="dashed"
					size="small"
					icon={<ArrowDownOutlined />}
					onClick={e => {
						e.stopPropagation();
						moveField(index, "down");
					}}
					disabled={isLast}
					style={{ opacity: isLast ? 0.3 : 1 }}
				/>
				<DeleteFieldCard index={index} size="sm" />
			</div>
		</div>
	);
}

export { CardHeader };
