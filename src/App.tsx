import "./styles.css";
import { useState, useEffect, lazy, Suspense } from "react";
import { ComponentInfo } from "./app/types";
import { FilesTree } from "./app/files-tree";

function App() {
	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);

	useEffect(() => {
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

	const SelectedComponentView = selectedComponent
		? lazy(() => import(/* @vite-ignore */ selectedComponent))
		: null;

	return (
		<div className="flex h-screen overflow-hidden">
			<FilesTree
				components={components}
				selectedComponent={selectedComponent}
				setSelectedComponent={setSelectedComponent}
			/>
			<main className="flex-1 flex flex-col overflow-hidden">
				{selectedComponent ? (
					<div className="flex-1 overflow-auto p-8 bg-white">
						<Suspense fallback={<div>Carregando...</div>}>
							{SelectedComponentView && <SelectedComponentView />}
						</Suspense>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2.5">
						<p>Nenhum componente encontrado em components</p>
						<p className="text-gray-400 text-sm">
							Crie seus componentes em components/ para começar
						</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
