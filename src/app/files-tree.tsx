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
		<aside className="w-70 bg-[#1e1e1e] text-white p-5 overflow-y-auto border-r border-[#333] flex flex-col">
			<h1 className="text-xl mb-5 pb-4 border-b border-[#333]">Components</h1>
			<div className="flex flex-col flex-1 overflow-y-auto">
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
