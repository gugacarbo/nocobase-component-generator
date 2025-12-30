import { useEffect, useState } from "react";
import { buildTree, getNodeAtPath } from "./utils";
import { BundleComponent } from "../bundle-component/bundle-component";
import { useAppContext } from "../context/app-context/use-app-context";
import { NavigationButtons } from "./navigation-buttons";
import { FolderView } from "./folder-view/folder-view";
import { TreeView } from "./tree-view/tree-view";

function FilesTree() {
	const {
		components,
		selectedComponent,
		setSelectedComponent,
		currentPath,
		setCurrentPath,
	} = useAppContext();

	const [viewMode, setViewMode] = useState<"folder" | "tree">(selectedComponent ? "tree" : "folder");

	const treeData = buildTree(components);

	useEffect(() => {
		if (selectedComponent && components.length > 0) {
			const component = components.find(c => c.path === selectedComponent);
			if (component) {
				const parts = component.name.split("/");
				setCurrentPath(parts.slice(0, -1));
			}
		}
	}, [selectedComponent, components]);

	const currentNodes =
		currentPath.length === 0
			? treeData
			: getNodeAtPath(treeData, currentPath)?.children || treeData;

	const navigateToFolder = (folderName: string) => {
		setCurrentPath([...currentPath, folderName]);
	};

	const handleFileSelect = (path: string) => {
		setSelectedComponent(path);
	};

	const handleGoHome = () => {
		setCurrentPath([]);
	};

	const handleGoBack = () => {
		setCurrentPath(currentPath.slice(0, -1));
	};

	const handleToggleViewMode = () => {
		setViewMode(viewMode === "folder" ? "tree" : "folder");
	};

	return (
		<aside className="w-full bg-slate-900 text-white p-5 overflow-y-auto border-r border-[#333] flex flex-col">
			<NavigationButtons
				currentPath={currentPath}
				viewMode={viewMode}
				onGoHome={handleGoHome}
				onToggleViewMode={handleToggleViewMode}
			/>

			{currentPath.length > 0 && viewMode === "folder" && (
				<button
					onClick={handleGoBack}
					className="text-base font-medium text-gray-300 flex items-center gap-2 mb-3 cursor-pointer"
				>
					📂 {currentPath[currentPath.length - 1]}
				</button>
			)}

			<div className="flex flex-col flex-1 overflow-y-auto gap-1">
				{viewMode === "folder" ? (
					<FolderView
						nodes={currentNodes}
						selectedComponent={selectedComponent}
						onFileSelect={handleFileSelect}
						onFolderClick={navigateToFolder}
					/>
				) : (
					<TreeView
						nodes={treeData}
						selectedComponent={selectedComponent}
						onFileSelect={handleFileSelect}
						level={0}
						currentPath={currentPath}
					/>
				)}
			</div>

			<BundleComponent
				components={components}
				selectedComponent={selectedComponent}
			/>
		</aside>
	);
}

export { FilesTree };
