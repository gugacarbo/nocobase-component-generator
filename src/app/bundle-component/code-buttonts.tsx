import { CodeOutlined } from "@ant-design/icons";
import { Button } from "@components/ui/Button";
import { useState } from "react";

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

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(bundleCode);
			return true;
		} catch (error) {
			return false;
		}
	};

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
		<div className="flex items-center">
			{bundleCode && (
				<Button
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
				{bundling ? "Gerando..." : "📦Bundle"}
			</Button>
			{bundleCode && (
				<Button
					style={{
						borderRadius: bundleCode ? "0px 6px 6px 0px" : "6px",
					}}
					onClick={handleCopy}
				>
					{copied ? "✓" : error ? "✕" : "📋"}
				</Button>
			)}
		</div>
	);
}

export { CodeButtons };
