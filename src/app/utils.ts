import { ComponentInfo, TreeNode } from "./types";

function countFiles(node: TreeNode): number {
	if (node.isFile) return 1;
	if (!node.children) return 0;
	return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

export function buildTree(components: ComponentInfo[]): TreeNode[] {
	const root: TreeNode[] = [];

	components.forEach(comp => {
		const parts = comp.name.split("/");
		let currentLevel = root;

		parts.forEach((part, index) => {
			const isLastPart = index === parts.length - 1;
			let existingNode = currentLevel.find(node => node.name === part);

			if (!existingNode) {
				existingNode = {
					name: part,
					isFile: isLastPart,
					children: isLastPart ? undefined : [],
					path: isLastPart ? comp.path : undefined,
				};
				currentLevel.push(existingNode);
			}

			if (!isLastPart && existingNode.children) {
				currentLevel = existingNode.children;
			}
		});
	});

	// Calcular contagem de arquivos para cada pasta
	root.forEach(node => {
		if (!node.isFile) {
			node.fileCount = countFiles(node);
		}
	});

	const calculateFileCounts = (nodes: TreeNode[]) => {
		nodes.forEach(node => {
			if (!node.isFile && node.children) {
				calculateFileCounts(node.children);
				node.fileCount = countFiles(node);
			}
		});
	};
	calculateFileCounts(root);

	return root;
}
