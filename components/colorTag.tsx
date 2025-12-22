// ctx.render(
//     <JsColoredTag
//     label={ctx.value.f_nome}
//     color={ctx.value.f_cor}
//     />
// );

import {
	darkenColor,
	getTextColor,
} from "./utils/color";

function ColorTag({
	color = "#09c",
	label = "label",
}: {
	color: string;
	label: string;
}) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<span
				style={{
					backgroundColor: color,
					color: getTextColor(color),
					padding: "2px 6px",
					borderRadius: "4px",
					fontWeight: "500",
					fontSize: "12px",
					border: `1px solid ${darkenColor(color, 0.3)}`, // Borda mais escura
					boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)", // Sombra sutil opcional
				}}
			>
				{label}
			</span>
		</div>
	);
}

export default ColorTag;
