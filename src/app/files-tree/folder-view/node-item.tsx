import { TreeNode } from "@/app/types";
import { FileOutlined } from "@ant-design/icons";

interface NodeItemProps {
	node: TreeNode;
	selectedComponent: string | null;
	onFileSelect: (path: string) => void;
	onFolderClick: (folderName: string) => void;
}

function NodeItem({
	node,
	selectedComponent,
	onFileSelect,
	onFolderClick,
}: NodeItemProps) {
	const isSelected = selectedComponent === node.path;

	if (node.isFile && node.path) {
		return (
			<button
				onClick={() => onFileSelect(node.path!)}
				className={`flex items-center gap-2 px-3 py-2 rounded transition-colors text-left ${
					isSelected
						? " text-amber-400 font-bold"
						: "hover:bg-[#2a2a2a] text-gray-300"
				}`}
			>
				<span className="text-blue-400">📄</span>
				<span className="truncate">{node.name}</span>
			</button>
		);
	}

	return (
		<button
			onClick={() => onFolderClick(node.name)}
			className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[#2a2a2a] rounded transition-colors text-left group"
		>
			<div className="flex items-center gap-2 min-w-0">
				<span className="text-yellow-400">📁</span>
				<span className="truncate text-gray-300 group-hover:text-white">
					{node.name}
				</span>
			</div>
			{node.fileCount !== undefined && node.fileCount > 0 && (
				<span className="text-xs text-gray-500 shrink-0">
					{node.fileCount} <FileOutlined />
				</span>
			)}
		</button>
	);
}

export { NodeItem };
