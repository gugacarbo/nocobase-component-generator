import { DeleteOutlined } from "@ant-design/icons";
import { Button, Popconfirm } from "antd";
import { useFieldsManagerContext } from "../context/use-fields-manager";

function DeleteFieldCard({
	index,
	size = "lg",
}: {
	index: number;
	size?: "sm" | "lg";
}) {
	const { removeField } = useFieldsManagerContext();

	return (
		<Popconfirm
			title="Deletar Campo"
			description="Tem certeza que deseja deletar este campo?"
			onConfirm={() => removeField(index)}
			okText="Sim"
			cancelText="Não"
		>
			<Button
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
				}}
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
