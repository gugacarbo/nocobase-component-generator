import { baseCtx as ctx } from "@/nocobase/ctx";
import { Form, Input } from "antd";

function FormValidation() {
	const form = ctx.form;

	return (
		<Form form={form} onFinish={values => alert(JSON.stringify(values))}>
			<Form.Item name="f_titulo" rules={[{ required: true }]}>
				<Input />
			</Form.Item>
		</Form>
	);
}
export default FormValidation;
