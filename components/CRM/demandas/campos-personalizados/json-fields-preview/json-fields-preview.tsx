import { ctx } from "./ctx.mock";

import { Button, Form } from "antd";
import { useState } from "react";
import { renderField } from "../components/render-field";
import { useForm } from "@/nocobase/utils/useForm";
import FullDiv from "@components/CRM/ui/full-div";
import { getFieldValidationRules } from "../validation-rules";

function JsonFieldsPreview() {
	const fields = ctx.value;
	const form = useForm();

	const [formData, setFormData] = useState<Record<string, any>>({});

	const handleChange = (fieldName: string, value: any) => {
		const newFormData = {
			...formData,
			[fieldName]: value,
		};
		setFormData(newFormData);
	};

	if (!fields || Object.keys(fields).length === 0) {
		return null;
	}

	return (
		<FullDiv>
			<Form form={form} layout="vertical">
				<div
					style={{
						display: "flex",
						flexDirection: "column",
					}}
				>
					{fields?.map((field, index) => (
						<Form.Item
							key={field?.name || index}
							name={field?.name}
							initialValue={formData[field?.name]}
							label={
								<span style={{ fontWeight: "bold" }}>
									{field.label || field?.name}
								</span>
							}
							rules={getFieldValidationRules(
								field.type,
								field?.required ?? false,
							)}
						>
							{renderField({
								field,
								handleChange,
								formData,
							})}
						</Form.Item>
					))}
				</div>
				<Button type="primary" htmlType="submit" style={{ marginTop: "1rem" }}>
					Testar Envio
				</Button>
			</Form>
		</FullDiv>
	);
}

export default JsonFieldsPreview;
