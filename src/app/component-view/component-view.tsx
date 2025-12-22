import { lazy, Suspense } from "react";
import { FilesTree } from "../files-tree/files-tree";
import { useAppContext } from "../context/app-context";

function ComponentView() {
	const { selectedComponent } = useAppContext();

	const SelectedComponentView = selectedComponent
		? lazy(() => import(/* @vite-ignore */ selectedComponent))
		: null;

	return (
		<div className="grid grid-cols-[300px_1fr] h-screen overflow-hidden">
			<FilesTree />
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

export { ComponentView };
