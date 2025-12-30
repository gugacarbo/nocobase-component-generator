import { TreeNode } from "../types";
import { TreeItem } from "./tree-item";

interface FileFolderItemProps {
	node: TreeNode;
	level: number;
	selectedComponent: string | null;
	onSelect: (path: string) => void;
	expandedFolders: Set<string>;
	onToggleFolder: (folderPath: string) => void;
	parentPath: string;
}

function FileFolderItem({
	node,
	level,
	selectedComponent,
	onSelect,
	expandedFolders,
	onToggleFolder,
	parentPath,
}: FileFolderItemProps) {
	const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
	const isExpanded = expandedFolders.has(currentPath);

	return (
		<div className="flex flex-col">
			<button
				className="bg-transparent border-0 text-[#ccc] py-2 px-3 text-left cursor-pointer rounded transition-all duration-200 text-sm flex items-center gap-2 w-full font-medium hover:bg-[#3d3d3d] hover:text-white group"
				style={{ paddingLeft: `${level * 16 + 12}px` }}
				onClick={() => onToggleFolder(currentPath)}
			>
				<span className="text-base shrink-0">{isExpanded ? "📂" : "📁"}</span>
				<span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
					{node.name}
				</span>
				{node.fileCount !== undefined && (
					<span className="bg-white/10 text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 group-hover:bg-white/15 group-hover:text-[#ccc]">
						{node.fileCount}
					</span>
				)}
			</button>
			{isExpanded && node.children && (
				<div className="flex flex-col">
					{node.children.map((child, index) => (
						<TreeItem
							key={`${currentPath}/${child.name}-${index}`}
							node={child}
							level={level + 1}
							selectedComponent={selectedComponent}
							onSelect={onSelect}
							expandedFolders={expandedFolders}
							onToggleFolder={onToggleFolder}
							parentPath={currentPath}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export { FileFolderItem };
