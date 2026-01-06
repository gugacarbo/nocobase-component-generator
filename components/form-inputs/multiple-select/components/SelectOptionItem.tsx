interface SelectOptionItemProps {
	label: string;
	color: string;
}

export function SelectOptionItem({ label, color }: SelectOptionItemProps) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<div
				style={{
					width: 12,
					height: 12,
					borderRadius: "50%",
					backgroundColor: color,
					border: "1px solid #d9d9d9",
				}}
			/>
			<span>{label}</span>
		</div>
	);
}
