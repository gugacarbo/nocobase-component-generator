import { useEffect, useState } from "react";

function Bar({ progress = 0 }) {
	const [internalProgress, setInternalProgress] = useState(0);

	useEffect(() => {
		let start = 0;
		const end = progress;
		if (start === end) return;

		let increment = end > start ? 1 : -1;
		const stepTime = Math.abs(end - start) > 50 ? 1 : 2; // Animação mais rápida para grandes diferenças

		const timer = setInterval(() => {
			start += increment;
			setInternalProgress(start);
			if (start === end) clearInterval(timer);
		}, stepTime);

		return () => clearInterval(timer); // Cleanup
	}, [progress]);

	// Usa HSL para transição suave de verde (120°) para vermelho (0°)
	const getProgressColor = (progress: number) => {
		const hue = 120 - (progress / 100) * 120; // 120 (verde) até 0 (vermelho)
		return `hsl(${hue}, 70%, 55%)`;
	};

	const bgColor = getProgressColor(internalProgress);

	return (
		<div
			style={{
				height: "6px",
				width: "100%",
				backgroundColor: "#E0E0E0",
				borderRadius: "3px",
			}}
		>
			<div
				style={{
					height: "100%",
					width: `${internalProgress}%`,
					backgroundColor: bgColor,
					borderRadius: "3px",
					transition: "background-color 0.1s ease",
				}}
			></div>
		</div>
	);
}
export { Bar };
