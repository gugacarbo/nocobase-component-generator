import { Card, Typography, Space } from "antd";
import { CamposTipo } from "@components/CRM/@types";
import { FieldValue } from "./field-value";

interface FieldCardProps {
	campo: CamposTipo;
	value: any;
	index?: number;
}

export function FieldCard({ campo, value }: FieldCardProps) {
	const hasValue = value !== null && value !== undefined && value !== "";

	return (
		<Card
			size="small"
			style={{
				marginBottom: 12,
				borderColor: hasValue ? "#d9d9d9" : "#f0f0f0",
				backgroundColor: hasValue ? "#ffffff" : "#fafafa",
			}}
			styles={{
				body: {
					padding: "12px 16px",
				},
			}}
		>
			<Space
				orientation="vertical"
				size={4}
				style={{ width: "100%", display: "grid" }}
			>
				<div>
					<Typography.Text strong style={{ fontSize: "13px" }}>
						{campo.label}
					</Typography.Text>
					{campo.required && (
						<Typography.Text type="danger" style={{ marginLeft: 4 }}>
							*
						</Typography.Text>
					)}
				</div>

				<div style={{ minHeight: 24 }}>
					<FieldValue campo={campo} value={value} />
				</div>
			</Space>
		</Card>
	);
}
