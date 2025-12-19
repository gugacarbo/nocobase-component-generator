import { useState, useEffect, lazy, Suspense } from "react";
import "./styles.css";

interface ComponentInfo {
	name: string;
	path: string;
	relativePath: string;
}

interface TreeNode {
	name: string;
	path?: string;
	children?: TreeNode[];
	isFile: boolean;
	fileCount?: number;
}

function countFiles(node: TreeNode): number {
	if (node.isFile) return 1;
	if (!node.children) return 0;
	return node.children.reduce((sum, child) => sum + countFiles(child), 0);
}

function buildTree(components: ComponentInfo[]): TreeNode[] {
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

interface TreeItemProps {
	node: TreeNode;
	level: number;
	selectedComponent: string | null;
	onSelect: (path: string) => void;
	expandedFolders: Set<string>;
	onToggleFolder: (folderPath: string) => void;
	parentPath?: string;
}

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

function App() {
	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);
	const [bundling, setBundling] = useState(false);
	const [bundleResult, setBundleResult] = useState<string>("");
	const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
		new Set(),
	);

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

	useEffect(() => {
		// Descobrir componentes automaticamente
		const componentModules = import.meta.glob("../components/**/*.{tsx,jsx}", {
			eager: false,
		});

		const foundComponents: ComponentInfo[] = Object.keys(componentModules).map(
			path => {
				const name = path
					.replace("../components/", "")
					.replace(/\.(tsx|jsx)$/, "");
				return {
					name,
					path,
					relativePath: path.replace("../", ""),
				};
			},
		);

		setComponents(foundComponents);
		if (foundComponents.length > 0) {
			setSelectedComponent(foundComponents[0].path);
		}
	}, []);

	const handleBundle = async () => {
		if (!selectedComponent) return;

		setBundling(true);
		setBundleResult("");

		try {
			const extensionMatch = selectedComponent.match(/\.(tsx|jsx)$/);
			const extension = extensionMatch ? extensionMatch[0] : ".tsx";
			const componentPath = selectedComponent
				.replace("../components/", "")
				.replace(/\.(tsx|jsx)$/, "");

			const response = await fetch("/api/bundle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					componentPath: `components/${componentPath}${extension}`,
				}),
			});

			const result = response?.body as unknown as {
				success: boolean;
				message?: string;
				error?: string;
			};

			if (response.ok) {
				setBundleResult(`✅ Bundle gerado com sucesso!\n${result.message}`);
			} else {
				setBundleResult(`❌ Erro: ${result.error}`);
			}
		} catch (error) {
			setBundleResult(
				`❌ Erro ao gerar bundle: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
		} finally {
			setBundling(false);
		}
	};

	const SelectedComponentView = selectedComponent
		? lazy(() => import(/* @vite-ignore */ selectedComponent))
		: null;

	const treeData = buildTree(components);

	return (
		<div className="app-container">
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
			</aside>

			<main className="main-content">
				{selectedComponent ? (
					<>
						<div className="component-preview">
							<Suspense fallback={<div>Carregando...</div>}>
								{SelectedComponentView && <SelectedComponentView />}
							</Suspense>
						</div>

						<div className="component-header">
							<h2>
								{components.find(c => c.path === selectedComponent)?.name}
							</h2>
							{bundleResult && (
								<div className="bundle-result">
									<pre>{bundleResult}</pre>
								</div>
							)}
							<button
								className="bundle-button"
								onClick={handleBundle}
								disabled={bundling}
							>
								{bundling ? "Gerando..." : "📦 Gerar Bundle"}
							</button>
						</div>
					</>
				) : (
					<div className="empty-state">
						<p>Nenhum componente encontrado em components</p>
						<p className="hint">
							Crie seus componentes em components/ para começar
						</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
