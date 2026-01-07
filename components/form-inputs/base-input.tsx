import { useForm } from "@/nocobase/utils/useForm";
import { Form, Input } from "antd";

function BaseInput() {
	const form = useForm();
	return (
		<Form form={form}>
			<Form.Item
				name={"f_titulo_demanda_90b09121347"}
				label={<span style={{ fontWeight: "bold" }}>Label</span>}
				rules={[
					{
						required: false,
						message: "Este campo é obrigatório",
					},
				]}
			>
				<Input />
			</Form.Item>
		</Form>
	);
}

export default BaseInput;
