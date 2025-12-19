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
			<div className="component-header">
				<h2>{components.find(c => c.path === selectedComponent)?.name}</h2>
				<button
					className="bundle-button"
					onClick={handleBundle}
					disabled={bundling}
				>
					{bundling ? "Gerando..." : "📦 Gerar Bundle"}
				</button>
			</div>

			{bundleResult && (
				<div className="bundle-result">
					<pre>{bundleResult}</pre>
				</div>
			)}

			{bundleCode && (
				<div className="code-viewer">
					<div className="code-header">
						<span className="code-title">📄 Código Gerado</span>
						<button
							className="copy-button"
							onClick={copyToClipboard}
							title="Copiar código"
						>
							📋 Copiar
						</button>
					</div>
					<pre className="code-content">
						<code>{bundleCode}</code>
					</pre>
				</div>
			)}
		</>
	);
}

export { ContentHeader };
