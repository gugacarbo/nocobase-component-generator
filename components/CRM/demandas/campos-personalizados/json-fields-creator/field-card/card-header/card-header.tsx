import { Field } from "../../../types";
import { DeleteFieldCard } from "../../components/delete-field-card";
import { Typography } from "antd";
import { useForm } from "@/nocobase/utils/useForm";
import { FIELD_TYPES } from "../../../constants";

function CardHeader({ field, index }: { field: Field; index: number }) {
	const form = useForm();

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
				{JSON.stringify(errors) !== "[]" && (
					<Typography.Text style={{ color: "red", marginRight: 8 }}>
						{errors.join(", ")}
					</Typography.Text>
				)}
			</div>
			<DeleteFieldCard index={index} size="sm" />
		</div>
	);
}

export { CardHeader };
