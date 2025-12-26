import { FilesTree } from "../files-tree/files-tree";
import { useAppContext } from "../context/app-context/use-app-context";
import { SelectedComponent } from "./selected-component";

function ComponentView() {
	const { selectedComponent } = useAppContext();

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
			<FilesTree />
			<main className="flex-1 flex flex-col overflow-hidden">
				{selectedComponent ? (
					<SelectedComponent />
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

export { ComponentView };
