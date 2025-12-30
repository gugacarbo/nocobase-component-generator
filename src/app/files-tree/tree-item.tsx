import { TreeItemProps } from "../types";
import { FileTreeItem } from "./file-tree-item";
import { FileFolderItem } from "./file-folder-item";

function TreeItem({
	node,
	level,
	selectedComponent,
	onSelect,
	expandedFolders,
	onToggleFolder,
	parentPath = "",
}: TreeItemProps) {
	if (node.isFile && node.path) {
		return (
			<FileTreeItem
				level={level}
				path={node.path}
				name={node.name}
				selectedComponent={selectedComponent}
				onSelect={onSelect}
			/>
		);
	}
	return (
		<FileFolderItem
			node={node}
			level={level}
			selectedComponent={selectedComponent}
			onSelect={onSelect}
			expandedFolders={expandedFolders}
			onToggleFolder={onToggleFolder}
			parentPath={parentPath}
		/>
	);
}

export { TreeItem };
