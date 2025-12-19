import { useState, useEffect, lazy, Suspense } from "react";
import "./styles.css";

interface ComponentInfo {
	name: string;
	path: string;
	relativePath: string;
}

function App() {
	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);
	const [bundling, setBundling] = useState(false);
	const [bundleResult, setBundleResult] = useState<string>("");

	useEffect(() => {
		// Descobrir componentes automaticamente
		const componentModules = import.meta.glob("./components/**/*.{tsx,jsx}", {
			eager: false,
		});

		const foundComponents: ComponentInfo[] = Object.keys(componentModules).map(
			path => {
				const name = path
					.replace("./components/", "")
					.replace(/\.(tsx|jsx)$/, "");
				return {
					name,
					path,
					relativePath: path.replace("./", "src/"),
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
				.replace("./components/", "")
				.replace(/\.(tsx|jsx)$/, "");

			const response = await fetch("/api/bundle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					componentPath: `src/components/${componentPath}${extension}`,
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

	return (
		<div className="app-container">
			<aside className="sidebar">
				<h1>Components</h1>
				<div className="component-list">
					{components.map(comp => (
						<button
							key={comp.path}
							className={
								selectedComponent === comp.path
									? "component-item active"
									: "component-item"
							}
							onClick={() => setSelectedComponent(comp.path)}
						>
							{comp.name}
						</button>
					))}
				</div>
			</aside>

			<main className="main-content">
				{selectedComponent ? (
					<>
						<div className="component-header">
							<h2>
								{components.find(c => c.path === selectedComponent)?.name}
							</h2>
							<button
								className="bundle-button"
								onClick={handleBundle}
								disabled={bundling}
							>
								{bundling ? "Gerando..." : "📦 Gerar Bundle"}
							</button>
						</div>

						{bundleResult && (
							<div className="bundle-result">
								<pre>{bundleResult}</pre>
							</div>
						)}

						<div className="component-preview">
							<Suspense fallback={<div>Carregando...</div>}>
								{SelectedComponentView && <SelectedComponentView />}
							</Suspense>
						</div>
					</>
				) : (
					<div className="empty-state">
						<p>Nenhum componente encontrado em src/components</p>
						<p className="hint">
							Crie seus componentes em src/components/ para começar
						</p>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
