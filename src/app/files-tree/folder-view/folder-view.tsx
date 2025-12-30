import { TreeNode } from "../../types";
import { NodeItem } from "./node-item";

interface FolderViewProps {
	nodes: TreeNode[];
	selectedComponent: string | null;
	onFileSelect: (path: string) => void;
	onFolderClick: (folderName: string) => void;
}

function FolderView({
	nodes,
	selectedComponent,
	onFileSelect,
	onFolderClick,
}: FolderViewProps) {
	return (
		nodes
			.sort((a, b) => {
				if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
				return a.isFile ? 1 : -1;
			})
			.map((node, index) => (
				<NodeItem
					key={`${node.name}-${index}`}
					node={node}
					selectedComponent={selectedComponent}
					onFileSelect={onFileSelect}
					onFolderClick={onFolderClick}
				/>
			))
	);
}



export { FolderView };
