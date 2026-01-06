import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useFieldsManagerContext } from "../context/use-fields-manager";

function AddFieldButton() {
	const { addField } = useFieldsManagerContext();
	return (
		<Button block icon={<PlusOutlined />} onClick={addField} type="primary">
			Adicionar Campo
		</Button>
	);
}

export { AddFieldButton };
