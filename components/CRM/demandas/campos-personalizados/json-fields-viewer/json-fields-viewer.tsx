import { useEffect, useState } from "react";
import { Spin } from "antd";
import { CamposTipo } from "@components/CRM/@types";
import { ctx } from "./ctx.mock";
import { FieldCard } from "./field-card";
import { FullDiv } from "@components/CRM/ui/full-div";
import { useConditionalFields } from "../hooks/use-conditional-fields";

function JsonFieldsViewer() {
	const [campos, setCampos] = useState<CamposTipo[]>([]);
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [loading, setLoading] = useState(true);

	const { visibleFields } = useConditionalFields(campos, formData);

	useEffect(() => {
		try {
			const value = ctx.value;
			if (value) {
				const parsed = typeof value === "string" ? JSON.parse(value) : value;
				const fieldsData = parsed.fieldsSnapshot || [];
				const dataValues = parsed.data || {};
				setCampos(fieldsData);
				setFormData(dataValues);
			}
		} catch (error) {
			console.error("Erro ao carregar dados:", error);
			setCampos([]);
			setFormData({});
		} finally {
			setLoading(false);
		}
	}, []);

	if (loading) {
		return (
			<div style={{ textAlign: "center", padding: "40px" }}>
				<Spin size="large" />
			</div>
		);
	}

	if (!visibleFields || visibleFields.length === 0) {
		return null;
	}

	return (
		<FullDiv>
			<div
				style={{
					overflowY: "auto",
					display: "grid",
					width: "100%",
				}}
			>
				{visibleFields.map((campo, index) => (
					<FieldCard
						key={campo.name || index}
						campo={campo}
						value={formData[campo.name]}
					/>
				))}
			</div>
		</FullDiv>
	);
}

export default JsonFieldsViewer;
