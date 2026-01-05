import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";

function DeleteFieldCard({
	onRemove,
	size = "lg",
}: {
	onRemove: () => void;
	size?: "sm" | "lg";
}) {
	return (
		<Popconfirm
			title="Deletar Campo"
			description="Tem certeza que deseja deletar este campo?"
			onConfirm={() => onRemove()}
			okText="Sim"
			cancelText="Não"
		>
			<Button
				icon={<DeleteOutlined />}
				type="default"
				size={size === "sm" ? "small" : "middle"}
				danger
			>
				{size === "sm" ? "" : "Excluir"}
			</Button>
		</Popconfirm>
	);
}

export { DeleteFieldCard };
