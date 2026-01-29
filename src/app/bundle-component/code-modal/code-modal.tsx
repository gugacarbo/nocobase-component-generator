import { CodeWrapper } from "./code-wrapper";
import { CopyCodeButton } from "./copy-code-button";

export function CodeModal({
	code,
	onClose,
}: {
	code: string;
	onClose: () => void;
}) {
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
				<CodeWrapper code={code} />
			</div>
		</div>
	);
}
