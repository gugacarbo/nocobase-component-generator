import { Typography } from "antd";
import { ExpandFieldsButton } from "./expand-fields-button";

function CreatorHeader() {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Typography.Title level={5}>Campos Personalizados: </Typography.Title>
			<ExpandFieldsButton />
		</div>
	);
}

export { CreatorHeader };
