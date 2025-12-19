import { useState, useEffect } from "react";
import { ComponentInfo } from "./types";
import { CopyCodeButton } from "./copy-code-button";

function CodeModal({ code, onClose }: { code: string; onClose: () => void }) {
	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(code);
			return true;
		} catch (error) {
			return false;
		}
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden max-w-4xl w-full max-h-[80vh] flex flex-col"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex justify-between items-center py-3 px-5 bg-[#2d2d2d] border-b border-[#333]">
					<span className="text-[#ccc] text-sm font-medium">
						📄 Código Gerado
					</span>
					<div className="flex gap-2">
						<CopyCodeButton copyToClipboard={copyToClipboard} />
						<button
							className="bg-[#444] text-white border-0 py-1.5 px-4 rounded cursor-pointer text-[13px] font-medium transition-colors duration-200 hover:bg-[#555]"
							onClick={onClose}
							title="Fechar"
						>
							✕ Fechar
						</button>
					</div>
				</div>
				<pre className="flex-1 overflow-auto p-5 m-0 text-[#d4d4d4] font-mono text-[13px] leading-relaxed whitespace-pre">
					<code className="block">{code}</code>
				</pre>
			</div>
		</div>
	);
}

function ContentHeader({
	components,
	selectedComponent,
}: {
	components: ComponentInfo[];
	selectedComponent: string | null;
}) {
	const [bundling, setBundling] = useState(false);
	const [bundleResult, setBundleResult] = useState<string>("");
	const [bundleCode, setBundleCode] = useState<string>("");
	const [showModal, setShowModal] = useState(false);

	// Reinicia estados quando muda de componente
	useEffect(() => {
		setBundleResult("");
		setBundleCode("");
		setShowModal(false);
	}, [selectedComponent]);

	const handleBundle = async () => {
		if (!selectedComponent) return;

		setBundling(true);
		setBundleResult("");
		setBundleCode("");

		try {
			const extensionMatch = selectedComponent.match(/\.(tsx|jsx)$/);
			const extension = extensionMatch ? extensionMatch[0] : ".tsx";
			const componentPath = selectedComponent
				.replace("../components/", "")
				.replace(/\.(tsx|jsx)$/, "");

			const response = await fetch("/api/bundle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					componentPath: `components/${componentPath}${extension}`,
				}),
			});

			const result = (await response.json()) as {
				success: boolean;
				message?: string;
				error?: string;
				code?: string;
			};

			if (response.ok && result.success) {
				setBundleResult(`✅ Bundle gerado com sucesso!`);
				if (result.code) {
					setBundleCode(result.code);
					setShowModal(true);
				}
			} else {
				setBundleResult(`❌ Erro: ${result.error}`);
			}
		} catch (error) {
			setBundleResult(
				`❌ Erro ao gerar bundle: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		} finally {
			setBundling(false);
		}
	};

	return (
		<>
			<div className="mt-auto pt-4 border-t border-[#333]">
				{selectedComponent && (
					<>
						<div
							className="mb-2 text-xs text-gray-400 truncate"
							title={components.find(c => c.path === selectedComponent)?.name}
						>
							{components.find(c => c.path === selectedComponent)?.name}
						</div>
						<button
							className="w-full bg-[#0066cc] text-white border-0 py-2.5 px-4 rounded-md cursor-pointer text-sm font-medium transition-colors duration-200 hover:bg-[#0052a3] disabled:bg-gray-600 disabled:cursor-not-allowed"
							onClick={handleBundle}
							disabled={bundling}
						>
							{bundling ? "Gerando..." : "📦 Gerar Bundle"}
						</button>
						{bundleResult && (
							<div className="mt-2 text-xs text-gray-400">{bundleResult}</div>
						)}
					</>
				)}
			</div>

			{showModal && bundleCode && (
				<CodeModal code={bundleCode} onClose={() => setShowModal(false)} />
			)}
		</>
	);
}

export { ContentHeader };
