import { FilesTree } from "../files-tree/files-tree";
import { useAppContext } from "../context/app-context/use-app-context";
import { SelectedComponent } from "./selected-component";
import { PathBreadcrumb } from "../files-tree/path-breadcrumb";

function ComponentView() {
	const { selectedComponent, isLoading, error } = useAppContext();

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
			<FilesTree />
			<div className="w-full flex bg-slate-700 flex-col h-screen">
				<PathBreadcrumb />
				<main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center h-full text-gray-200 gap-2.5">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-200"></div>
							<p className="text-lg font-medium">Carregando componentes...</p>
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center h-full text-red-400 gap-2.5 text-lg">
							<svg
								className="w-16 h-16"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="font-bold">Erro ao Carregar Componentes</p>
							<p className="text-gray-300 text-sm max-w-md text-center">
								{error.message}
							</p>
						</div>
					) : selectedComponent ? (
						<SelectedComponent />
					) : (
						<div className="flex flex-col items-center justify-center h-full text-gray-200 gap-2.5 text-lg">
							<p className="font-bold">Nenhum Componente Selecionado</p>
							<p className="text-gray-300 text-sm">
								Crie seus componentes em
								<span className="text-gray-200 font-medium font-mono bg-gray-800 p-0.5 mx-1 rounded">
									components/
								</span>
								para começar
							</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export { ComponentView };
