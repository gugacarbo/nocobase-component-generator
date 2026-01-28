import { Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useFieldsManagerContext } from "../context/use-fields-manager";

function ExpandFieldsButton() {
	const { fields, activeKeys, toggleActiveKeys } = useFieldsManagerContext();

	if (fields.length === 0) return null;
	return (
		<Button
			style={{ marginRight: 8 }}
			onClick={() => toggleActiveKeys()}
			size="small"
		>
			{activeKeys.length === 0 ? "Expandir Tudo" : "Recolher Tudo"}
			<DownOutlined
				style={{
					transform:
						activeKeys.length === 0 ? "rotate(0deg)" : "rotate(180deg)",
					transition: "transform 0.2s",
				}}
			/>
		</Button>
	);
}

export { ExpandFieldsButton };
