import { useState, useEffect } from "react";
import { TreeNode } from "../types";

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
							<button
								onClick={() => onFileSelect(node.path!)}
								className={`flex items-center gap-2 px-3 py-2 rounded transition-colors text-left ${
									selectedComponent === node.path
										? "text-amber-400 font-bold"
										: "hover:bg-[#2a2a2a] text-gray-300"
								}`}
								style={{ paddingLeft: `${level * 20 + 12}px` }}
							>
								<span className="text-blue-400">📄</span>
								<span className="truncate">{node.name}</span>
							</button>
						) : (
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
						)}
					</div>
				))}
		</>
	);
}

export { TreeView };
