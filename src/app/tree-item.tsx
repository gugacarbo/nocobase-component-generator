import { TreeItemProps } from "./types";

function TreeItem({
	node,
	level,
	selectedComponent,
	onSelect,
	expandedFolders,
	onToggleFolder,
	parentPath = "",
}: TreeItemProps) {
	const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
	const isExpanded = expandedFolders.has(currentPath);

	if (node.isFile && node.path) {
		return (
			<button
				className={
					selectedComponent === node.path
						? "tree-item file active"
						: "tree-item file"
				}
				style={{ paddingLeft: `${level * 16 + 12}px` }}
				onClick={() => onSelect(node.path!)}
			>
				<span className="tree-icon">📄</span>
				<span className="tree-label">{node.name}</span>
			</button>
		);
	}

	return (
		<div className="tree-folder">
			<button
				className="tree-item folder"
				style={{ paddingLeft: `${level * 16 + 12}px` }}
				onClick={() => onToggleFolder(currentPath)}
			>
				<span className="tree-icon">{isExpanded ? "📂" : "📁"}</span>
				<span className="tree-label">{node.name}</span>
				{node.fileCount !== undefined && (
					<span className="file-count">{node.fileCount}</span>
				)}
			</button>
			{isExpanded && node.children && (
				<div className="tree-children">
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

export { TreeItem };
