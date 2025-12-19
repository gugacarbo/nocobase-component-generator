import { buildTree } from "./utils";
import { TreeItem } from "./tree-item";
import { ComponentInfo } from "./types";
import { useState } from "react";
import { ContentHeader } from "./content-header";

function FilesTree({
	components,
	selectedComponent,
	setSelectedComponent,
}: {
	components: ComponentInfo[];
	selectedComponent: string | null;
	setSelectedComponent: (componentName: string | null) => void;
}) {
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);
	const treeData = buildTree(components);

	const toggleFolder = (folderPath: string) => {
		setExpandedFolders(prev => {
			const next = new Set(prev);
			if (next.has(folderPath)) {
				next.delete(folderPath);
			} else {
				next.add(folderPath);
			}
			return next;
		});
	};
	return (
		<aside className="sidebar">
			<h1>Components</h1>
			<div className="component-tree">
				{treeData.map((node, index) => (
					<TreeItem
						key={`${node.name}-${index}`}
						node={node}
						level={0}
						selectedComponent={selectedComponent}
						onSelect={setSelectedComponent}
						expandedFolders={expandedFolders}
						onToggleFolder={toggleFolder}
					/>
				))}
			</div>
			<ContentHeader
				components={components}
				selectedComponent={selectedComponent}
			/>
		</aside>
	);
}

export { FilesTree };
