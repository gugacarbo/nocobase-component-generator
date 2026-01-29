import { HomeOutlined, FolderOutlined } from "@ant-design/icons";
import { FolderTreeIcon } from "lucide-react";

interface NavigationButtonsProps {
	currentPath: string[];
	viewMode: "folder" | "tree";
	onGoHome: () => void;
	onToggleViewMode: () => void;
}

function NavigationButtons({
	currentPath,
	viewMode,
	onGoHome,
	onToggleViewMode,
}: NavigationButtonsProps) {
	return (
		<div className="flex items-center gap-2 justify-between mb-4">
			<div className="flex items-center gap-2">
				{currentPath.length >= 0 && (
					<button
						onClick={onGoHome}
						className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded transition-colors text-gray-200"
						disabled={currentPath.length === 0}
					>
						<span>
							<HomeOutlined />
						</span>
					</button>
				)}
			</div>

			<button
				onClick={onToggleViewMode}
				className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded transition-colors text-gray-200"
				title={
					viewMode === "folder"
						? "Visualizar em árvore"
						: "Visualizar em pastas"
				}
			>
				{viewMode === "folder" ? (
					<FolderTreeIcon className="size-4" strokeWidth={1.5} />
				) : (
					<FolderOutlined />
				)}
			</button>
		</div>
	);
}

export { NavigationButtons };
