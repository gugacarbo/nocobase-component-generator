import { useState } from "react";
import { ComponentInfo } from "./types";

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

	const copyToClipboard = async () => {
		if (!bundleCode) return;
		try {
			await navigator.clipboard.writeText(bundleCode);
			setBundleResult("✅ Código copiado para a área de transferência!");
		} catch (error) {
			setBundleResult("❌ Erro ao copiar código");
		}
	};

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
				setBundleResult(`✅ Bundle gerado com sucesso!\n${result.message}`);
				if (result.code) {
					setBundleCode(result.code);
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
			<div className="flex justify-between items-center p-5 px-8 bg-white border-t border-gray-200 shadow-[2px_-2px_4px_rgba(0,0,0,0.05)]">
				<h2 className="text-2xl text-gray-800">{components.find(c => c.path === selectedComponent)?.name}</h2>
				<button
					className="bg-[#0066cc] text-white border-0 py-2.5 px-5 rounded-md cursor-pointer text-sm font-medium transition-colors duration-200 hover:bg-[#0052a3] disabled:bg-gray-300 disabled:cursor-not-allowed"
					onClick={handleBundle}
					disabled={bundling}
				>
					{bundling ? "Gerando..." : "📦 Gerar Bundle"}
				</button>
			</div>

			{bundleResult && (
				<div className="m-5 mx-8 p-4 w-[calc(100%-64px)] bg-gray-100 border border-gray-200 rounded-md font-mono text-[13px]">
					<pre className="whitespace-pre-wrap m-0">{bundleResult}</pre>
				</div>
			)}

			{bundleCode && (
				<div className="m-5 mx-8 bg-[#1e1e1e] border border-[#333] rounded-lg overflow-hidden max-h-[500px] flex flex-col">
					<div className="flex justify-between items-center py-3 px-5 bg-[#2d2d2d] border-b border-[#333]">
						<span className="text-[#ccc] text-sm font-medium">📄 Código Gerado</span>
						<button
							className="bg-[#0066cc] text-white border-0 py-1.5 px-4 rounded cursor-pointer text-[13px] font-medium transition-colors duration-200 hover:bg-[#0052a3]"
							onClick={copyToClipboard}
							title="Copiar código"
						>
							📋 Copiar
						</button>
					</div>
					<pre className="flex-1 overflow-auto p-5 m-0 text-[#d4d4d4] font-mono text-[13px] leading-relaxed whitespace-pre">
						<code className="block">{bundleCode}</code>
					</pre>
				</div>
			)}
		</>
	);
}

export { ContentHeader };
