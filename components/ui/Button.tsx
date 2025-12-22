import React from "react";

interface ButtonProps {
	onClick?: () => void;
	children: React.ReactNode;
	variant?: "primary" | "secondary";
	style?: React.CSSProperties;
	className?: string;
	disabled?: boolean;
}

export function Button({
	onClick,
	children,
	variant = "primary",
	style,
	className,
	disabled,
}: ButtonProps) {
	const baseStyle = {
		padding: "10px 20px",
		borderRadius: "6px",
		border: "none",
		cursor: "pointer",
		fontSize: "14px",
		fontWeight: 500,
		transition: "all 0.2s",
	};

	const variantStyles = {
		primary: {
			background: "#1976d2",
			color: "white",
		},
		secondary: {
			background: "#f5f5f5",
			color: "#333",
		},
	};

	return (
		<button
			onClick={onClick}
			className={className}
			style={{ ...baseStyle, ...variantStyles[variant], ...style }}
			onMouseOver={e => {
				e.currentTarget.style.opacity = "0.8";
			}}
			onMouseOut={e => {
				e.currentTarget.style.opacity = "1";
			}}
			disabled={disabled}
		>
			{children}
		</button>
	);
}
