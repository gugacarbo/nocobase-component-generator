import { lazy, Suspense, useEffect, useState } from "react";
import { useAppContext } from "../context/app-context/use-app-context";
import { ErrorBoundary } from "./error-boundary";
import { useDefaultProps } from "./use-default-props";

function SelectedComponent() {
	const { selectedComponent } = useAppContext();
	const componentProps = useDefaultProps();
	const SelectedComponentView = selectedComponent
		? lazy(() => import(/* @vite-ignore */ selectedComponent))
		: null;

	if (!SelectedComponentView) {
		return null;
	}
	return (
		<div className="flex-1 overflow-auto p-4 m-4 bg-white border-2 border-gray-300 rounded-lg">
			<ErrorBoundary>
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
								<p className="text-gray-600">Carregando componente...</p>
							</div>
						</div>
					}
				>
					{SelectedComponentView && (
						<SelectedComponentView {...componentProps} />
					)}
				</Suspense>
			</ErrorBoundary>
		</div>
	);
}

export { SelectedComponent };
