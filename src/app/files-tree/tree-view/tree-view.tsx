import { useState, useEffect } from "react";
import { TreeNode } from "../../types";
import { FileTreeItem } from "./file-tree-item";
import { FolderTreeItem } from "./folder-tree-item";

interface TreeViewProps {
	nodes: TreeNode[];
	selectedComponent: string | null;
	onFileSelect: (path: string) => void;
	level: number;
	currentPath: string[];
	parentPath?: string[];
}

function TreeView({
	nodes,
	selectedComponent,
	onFileSelect,
	level,
	currentPath,
	parentPath = [],
}: TreeViewProps) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

	// Expande automaticamente as pastas do currentPath
	useEffect(() => {
		if (currentPath.length > level) {
			const folderAtLevel = currentPath[level];
			if (folderAtLevel) {
				setExpandedFolders(prev => {
					const next = new Set(prev);
					next.add(folderAtLevel);
					return next;
				});
			}
		}
	}, [currentPath, level]);

	const toggleFolder = (name: string) => {
		setExpandedFolders(prev => {
			const next = new Set(prev);
			if (next.has(name)) {
				next.delete(name);
			} else {
				next.add(name);
			}
			return next;
		});
	};

	return (
		<>
			{nodes
				.sort((a, b) => {
					if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
					return a.isFile ? 1 : -1;
				})
				.map((node, index) => (
					<div key={`${node.name}-${index}`}>
						{node.isFile && node.path ? (
							<FileTreeItem
								key={`${node.name}-${index}`}
								selectedComponent={selectedComponent}
								level={level}
								path={node.path}
								name={node.name}

							/>
						) : (
							<FolderTreeItem
								key={`${node.name}-${index}`}
								node={node}
								level={level}
								selectedComponent={selectedComponent}
								onFileSelect={onFileSelect}
								expandedFolders={expandedFolders}
								toggleFolder={toggleFolder}
								parentPath={parentPath}
								currentPath={currentPath}
							/>
						)}
					</div>
				))}
		</>
	);
}

export { TreeView };
