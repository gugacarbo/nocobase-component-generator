import { FilesTree } from "../files-tree/files-tree";
import { useAppContext } from "../context/app-context/use-app-context";
import { SelectedComponent } from "./selected-component";
import { PathBreadcrumb } from "../files-tree/path-breadcrumb";

function ComponentView() {
	const { selectedComponent } = useAppContext();

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
			<FilesTree />
			<div className="w-full flex bg-slate-700 flex-col h-screen">
				<PathBreadcrumb />
				<main className="flex-1  flex flex-col overflow-y-auto overflow-x-hidden">
					{selectedComponent ? (
						<SelectedComponent />
					) : (
						<div className="flex flex-col items-center justify-center h-full text-gray-200 gap-2.5 text-lg">
							<p className="font-bold">Nenhum Componente Selecionado</p>
							<p className="text-gray-300 text-sm">
								Crie seus componentes em
								<span className="text-gray-200 font-medium font-mono bg-gray-800 p-0.5 mx-1 rounded">components/</span>
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
