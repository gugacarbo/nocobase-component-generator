import { buildTree } from "./utils";
import { TreeItem } from "./tree-item";
import { useState } from "react";
import { BundleComponent } from "../bundle-component/bundle-component";
import { useAppContext } from "../context/use-app-context";

function FilesTree() {
	const { components, selectedComponent, setSelectedComponent } =
		useAppContext();
		
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
		<aside className="w-full  bg-[#1e1e1e] text-white p-5 overflow-y-auto border-r border-[#333] flex flex-col">
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
			<BundleComponent
				components={components}
				selectedComponent={selectedComponent}
			/>
		</aside>
	);
}

export { FilesTree };
