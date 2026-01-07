import { formatRelativeTime } from "@components/utils/dateUtils";
import { useState, useRef } from "react";

export const defaultProps = {
	dateStr: "2025-12-16T17:09:30.569Z",
};

function DateTimeField({
	dateStr = defaultProps.dateStr,
}: {
	dateStr: string | null;
}) {
	const [isHovering, setIsHovering] = useState(false);

	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const delay = 200;

	if (!dateStr) {
		return "";
	}

	const relativeTime = formatRelativeTime(new Date(dateStr));
	const fullDate = new Date(dateStr).toLocaleString("pt-BR");

	const handleMouseEnter = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			setIsHovering(true);
		}, delay);
	};

	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		setIsHovering(false);
	};

	return (
		<div
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={{
				width: "100%",
				display: "flex",
				justifyContent: "center",
				cursor: "default",
			}}
		>
			<div
				style={{
					color: "#333",
					fontSize: "14px",
					fontWeight: "500",
				}}
			>
				{isHovering ? fullDate : relativeTime}
			</div>
		</div>
	);
}

export default DateTimeField;

export { DateTimeField };
