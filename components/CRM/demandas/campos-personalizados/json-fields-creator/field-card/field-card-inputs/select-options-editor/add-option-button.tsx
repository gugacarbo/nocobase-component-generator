import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

function AddOptionButton({ onClick }: { onClick: () => void }) {
	return (
		<Button type="default" block icon={<PlusOutlined />} onClick={onClick}>
			Adicionar Opção
		</Button>
	);
}

export { AddOptionButton };
