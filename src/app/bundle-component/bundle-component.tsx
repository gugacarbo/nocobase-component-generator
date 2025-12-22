import { useState, useEffect } from "react";
import { ComponentInfo } from "../types";
import { CodeModal } from "../code-modal/code-modal";
import {
	APP_CONFIG,
	removeComponentsPrefix,
	buildComponentApiPath,
} from "../config";

function BundleComponent({
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
			const extensionPattern = new RegExp(
				`\\.(${APP_CONFIG.supportedExtensions.map(e => e.slice(1)).join("|")})`,
			);
			const extensionMatch = selectedComponent.match(extensionPattern);
			const extension = extensionMatch
				? extensionMatch[0]
				: APP_CONFIG.supportedExtensions[0];
			const componentRelativePath = removeComponentsPrefix(selectedComponent);
			const componentPath = componentRelativePath.replace(extensionPattern, "");

			const response = await fetch(APP_CONFIG.bundleApiEndpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					componentPath: buildComponentApiPath(`${componentPath}${extension}`),
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

export { BundleComponent };
