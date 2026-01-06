import { Tag } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { TagRenderProps } from "../types";

interface SelectTagProps extends TagRenderProps {
	getColorById: (id: any) => string;
}

export function SelectTag({
	value,
	label,
	closable,
	onClose,
	getColorById,
}: SelectTagProps) {
	return (
		<Tag
			color={getColorById(value)}
			style={{
				display: "flex",
				alignItems: "center",
				gap: 4,
				marginRight: 4,
				borderRadius: 4,
				fontWeight: 500,
			}}
		>
			{label}
			{closable && (
				<span
					onMouseDown={e => e.stopPropagation()}
					onClick={onClose}
					style={{ cursor: "pointer", display: "flex" }}
				>
					<CloseOutlined style={{ fontSize: 10 }} />
				</span>
			)}
		</Tag>
	);
}
