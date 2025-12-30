export interface TreeNode {
	name: string;
	path?: string;
	children?: TreeNode[];
	isFile: boolean;
	fileCount?: number;
}

export interface TreeItemProps {
	node: TreeNode;
	level: number;
	selectedComponent: string | null;
	onSelect: (path: string) => void;
	expandedFolders: Set<string>;
	toggleFolder: (folderPath: string) => void;
	parentPath?: string[];
}

export interface ComponentInfo {
	name: string;
	path: string;
	relativePath: string;
}
