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
		<div className="app-container">
			<FilesTree
				components={components}
				selectedComponent={selectedComponent}
				setSelectedComponent={setSelectedComponent}
			/>
			<main className="main-content">
				{selectedComponent ? (
					<div className="component-preview">
						<Suspense fallback={<div>Carregando...</div>}>
							{SelectedComponentView && <SelectedComponentView />}
						</Suspense>
					</div>
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
