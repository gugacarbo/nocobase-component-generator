import { Form, Input } from "antd";

function FormValidation() {
	//bundle-only: const form = ctx.form;
	const [form] = Form.useForm(); //no-bundle:

	return (
		<Form form={form} onFinish={values => console.log(JSON.stringify(values))}>
			<Form.Item name="f_titulo_demanda_9f121be77a1" rules={[{ required: true }]}>
				<Input />
			</Form.Item>
		</Form>
	);
}
export default FormValidation;
