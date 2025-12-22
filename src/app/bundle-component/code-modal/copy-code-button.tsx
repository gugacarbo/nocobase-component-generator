import { useState } from "react";

function CopyCodeButton({
	copyToClipboard,
}: {
	copyToClipboard: () => Promise<boolean>;
}) {
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);

	const handleCopy = async () => {
		const success = await copyToClipboard();
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} else {
			setError(true);
			setTimeout(() => setError(false), 2000);
		}
	};

	return (
		<button
			className={`border-0 py-1.5 px-4 rounded cursor-pointer text-[13px] font-medium transition-all duration-200 ${
				copied
					? "bg-green-600 text-white scale-105"
					: error
						? "bg-red-600 text-white scale-105"
						: "bg-[#0066cc] text-white hover:bg-[#0052a3]"
			}`}
			onClick={handleCopy}
			title={copied ? "Copiado!" : error ? "Erro ao copiar" : "Copiar código"}
		>
			{copied ? "✓ Copiado!" : error ? "✕ Erro" : "📋 Copiar"}
		</button>
	);
}

export { CopyCodeButton };
