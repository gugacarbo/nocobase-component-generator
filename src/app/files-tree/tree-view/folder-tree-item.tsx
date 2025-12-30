import { TreeNode } from "../../types";
import { TreeView } from "./tree-view";

interface FolderTreeItemProps {
	node: TreeNode;
	level: number;
	selectedComponent: string | null;
	onFileSelect: (path: string) => void;
	expandedFolders: Set<string>;
	toggleFolder: (folderPath: string) => void;
	parentPath: string[];
	currentPath: string[];
}


function FolderTreeItem({
	node,
	level,
	selectedComponent,
	onFileSelect,
	expandedFolders,
	toggleFolder,
	parentPath,

	currentPath,
}: FolderTreeItemProps) {


	return (
		<>
			<button
				onClick={() => toggleFolder(node.name)}
				className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[#2a2a2a] rounded transition-colors text-left group w-full"
				style={{ paddingLeft: `${level * 20 + 12}px` }}
			>
				<div className="flex items-center gap-2 min-w-0">
					<span>{expandedFolders.has(node.name) ? "📂" : "📁"}</span>
					<span className="truncate text-gray-300 group-hover:text-white">
						{node.name}
					</span>
				</div>
				{node.fileCount !== undefined && node.fileCount > 0 && (
					<span className="text-xs text-gray-500 shrink-0">
						{node.fileCount}{" "}
						{node.fileCount === 1 ? "arquivo" : "arquivos"}
					</span>
				)}
			</button>
			{expandedFolders.has(node.name) && node.children && (
				<TreeView
					nodes={node.children}
					selectedComponent={selectedComponent}
					onFileSelect={onFileSelect}
					level={level + 1}
					currentPath={currentPath}
					parentPath={[...parentPath, node.name]}

				/>
			)}
		</>
	);
}

export { FolderTreeItem };
