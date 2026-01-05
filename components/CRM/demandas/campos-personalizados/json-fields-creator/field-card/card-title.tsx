import { Typography } from "antd";
import { Field } from "../../types";

function CardTitle({ field }: { field: Field }) {
	return (
		<Typography.Title level={5} style={{ margin: 0 }}>
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
	);
}

export { CardTitle };
