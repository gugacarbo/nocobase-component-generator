import { CodeOutlined } from "@ant-design/icons";
import { Button } from "@components/ui/Button";
import { useState, useEffect, useRef } from "react";

function CodeButtons({
	bundling,
	handleBundle,
	bundleCode,
	openModal,
}: {
	bundling: boolean;
	handleBundle: () => void;
	bundleCode: string;
	openModal: () => void;
}) {
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState(false);
	const [autoCopy, setAutoCopy] = useState(false);
	const [clickCount, setClickCount] = useState(0);
	const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
	const previousBundleCodeRef = useRef<string>("");

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(bundleCode);
			return true;
		} catch (error) {
			return false;
		}
	};

	const handleCopy = async () => {
		// Incrementa o contador de cliques
		setClickCount((prev) => prev + 1);

		// Limpa o timer anterior se existir
		if (clickTimerRef.current) {
			clearTimeout(clickTimerRef.current);
		}

		// Define um novo timer para resetar o contador
		clickTimerRef.current = setTimeout(() => {
			setClickCount(0);
		}, 300); // 300ms para detectar duplo clique

		// Copia o código
		const success = await copyToClipboard();
		if (success) {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} else {
			setError(true);
			setTimeout(() => setError(false), 2000);
		}
	};

	// Detecta duplo clique e ativa/desativa auto-copy
	useEffect(() => {
		if (clickCount === 2) {
			setAutoCopy((prev) => !prev);
			setClickCount(0);
		}
	}, [clickCount]);

	// Auto-copy quando o bundle é gerado
	useEffect(() => {
		if (
			autoCopy &&
			bundleCode &&
			bundleCode !== previousBundleCodeRef.current &&
			!bundling
		) {
			copyToClipboard().then((success) => {
				if (success) {
					setCopied(true);
					setTimeout(() => setCopied(false), 2000);
				}
			});
		}
		previousBundleCodeRef.current = bundleCode;
	}, [bundleCode, autoCopy, bundling]);

	// Cleanup do timer
	useEffect(() => {
		return () => {
			if (clickTimerRef.current) {
				clearTimeout(clickTimerRef.current);
			}
		};
	}, []);

	return (
		<div className="flex items-center">
			{bundleCode && (
				<Button
					disabled={bundling}

					style={{
						borderRadius: bundleCode ? "6px 0px 0px 6px" : "6px",
					}}
					onClick={openModal}
				>
					<CodeOutlined />
				</Button>
			)}
			<Button
				className="w-full bg-[#0066cc] hover:bg-[#0052a3] disabled:bg-gray-600 "
				onClick={handleBundle}
				disabled={bundling}
				style={{
					borderRadius: bundleCode ? "0px" : "6px",
				}}
			>
				{bundling ? "Gerando..." : "📦 Bundle"}
			</Button>
			{bundleCode && (
				<Button
					disabled={bundling}
					style={{
						borderRadius: bundleCode ? "0px 6px 6px 0px" : "6px",
						backgroundColor: autoCopy ? "#07884cff" : "#1976d2",
						boxShadow: autoCopy ? "0 0 8px rgba(16, 185, 129, 0.3)" : undefined,
					}}
					onClick={handleCopy}
				>
					{copied ? "✓" : error ? "✕" : autoCopy ? "🔄" : "📋"}
				</Button>
			)}
		</div>
	);
}

export { CodeButtons };
