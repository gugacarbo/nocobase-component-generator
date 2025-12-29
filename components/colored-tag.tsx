import FullDiv from "@components/ui/full-div";
import { darkenColor, getTextColor } from "@utils/color";

export const defaultProps = {
	color: "#3b82f6",
	label: "Tag de Exemplo",
};

function ColoredTag({
	color = defaultProps.color,
	label = defaultProps.label,
}: {
	color: string;
	label: string;
}) {
	return (
		<FullDiv>
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
						border: `1px solid ${darkenColor(color, 0.3)}`,
						boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
					}}
				>
					{label}
				</span>
			</div>
		</FullDiv>
	);
}

export default ColoredTag;
