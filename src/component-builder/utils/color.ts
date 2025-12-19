export function getTextColor(
	bgColor: string,
	options = {
		threshold: 0.6,
		darkColor: "#000000",
		lightColor: "#FFFFFF",
	},
) {
	const { threshold, darkColor, lightColor } = options;

	if (!bgColor) return darkColor;

	// Suporta também cores RGB/RGBA
	if (bgColor.startsWith("rgb")) {
		const matches = bgColor.match(/\d+/g);
		if (matches && matches.length >= 3) {
			const [r, g, b] = matches.map(Number);
			const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
			return luminance > threshold ? darkColor : lightColor;
		}
	}
	let hex = bgColor.replace("#", "").toUpperCase();
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map(char => char + char)
			.join("");
	}
	if (!/^[0-9A-F]{6}$/i.test(hex)) {
		console.warn("Cor inválida:", bgColor);
		return darkColor;
	}
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
	return luminance > threshold ? darkColor : lightColor;
}

export function darkenColor(color: string, amount = 0.2) {
	if (!color) return "#000000";

	if (color.startsWith("rgb")) {
		const matches = color.match(/\d+/g);
		if (matches && matches.length >= 3) {
			const [r, g, b] = matches.map(Number);
			const newR = Math.round(r * (1 - amount));
			const newG = Math.round(g * (1 - amount));
			const newB = Math.round(b * (1 - amount));
			return `rgb(${newR}, ${newG}, ${newB})`;
		}
	}

	let hex = color.replace("#", "");

	if (hex.length === 3) {
		hex = hex
			.split("")
			.map(char => char + char)
			.join("");
	}

	if (!/^[0-9A-F]{6}$/i.test(hex)) {
		return "#000000";
	}

	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	const newR = Math.round(r * (1 - amount));
	const newG = Math.round(g * (1 - amount));
	const newB = Math.round(b * (1 - amount));

	const toHex = (n: number) => {
		const hex = n.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};

	return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}
