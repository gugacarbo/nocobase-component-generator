import { useEffect, useState } from "react";
import { ComponentInfo } from "../../types";
import { APP_CONFIG } from "@/config/config";
import { AppContext } from "./context";
import { PathUtils } from "@common/utils";
import { getComponentPathInfo, removeExtension } from "../../utils/path-utils";
import { Logger } from "@/common/Logger";

interface AppProviderProps {
	children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
	const [currentPath, setCurrentPath] = useState<string[]>([]);
	const [components, setComponents] = useState<ComponentInfo[]>([]);
	const [selectedComponent, setSelectedComponent] = useState<string | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Atualiza selectedComponent na URL
	useEffect(() => {
		if (selectedComponent) {
			try {
				const { urlPath, file } = getComponentPathInfo(selectedComponent);
				const url = new URL(window.location.origin + urlPath);
				url.searchParams.set("file", file);
				window.history.replaceState({}, "", url.toString());
			} catch (err) {
				Logger.error("Erro ao atualizar URL", err);
			}
		}
	}, [selectedComponent]);

	// Carrega componentes e restaura selectedComponent da URL
	useEffect(() => {
		const componentModules = Object.fromEntries(
			Object.entries(
				import.meta.glob("../../../../**/*.{tsx,jsx}", {
					eager: false,
					import: "default",
				}),
			).filter(([path]) =>
				path.startsWith("../../../../" + APP_CONFIG.componentsPath),
			),
		);

		const loadComponents = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const foundComponents: ComponentInfo[] = [];
				const failedComponents: string[] = [];

				for (const [path, loader] of Object.entries(componentModules)) {
					try {
						const module = await loader();
						if (module) {
							const relativePath = PathUtils.removeComponentsPrefix(path);
							const name = removeExtension(relativePath);

							foundComponents.push({
								name,
								path,
								relativePath,
							});
						}
					} catch (err) {
						failedComponents.push(path);
						Logger.error.verbose(`Erro ao carregar componente ${path}`, err);
					}
				}

				if (failedComponents.length > 0) {
					Logger.info.verbose(
						`${failedComponents.length} componente(s) ignorado(s) (sem export default ou com erro)`,
					);
				}

				setComponents(foundComponents);

				// Restaura selectedComponent da URL, se existir
				const pathname = window.location.pathname;
				const urlFile = new URLSearchParams(window.location.search).get("file");

				if (pathname !== "/" && urlFile) {
					const pathSegments = pathname.split("/").filter(Boolean);
					const reconstructedPath = pathSegments.join("/");

					const matchingComponent = foundComponents.find(c => {
						const { pathWithoutExt } = getComponentPathInfo(c.path);
						return pathWithoutExt === reconstructedPath;
					});

					if (matchingComponent) {
						setSelectedComponent(matchingComponent.path);
					} else {
						Logger.info.verbose(
							`Componente da URL não encontrado: ${reconstructedPath}`,
						);
					}
				}
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				Logger.error("Erro ao carregar componentes", error);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadComponents();
	}, []);

	return (
		<AppContext.Provider
			value={{
				components,
				selectedComponent,
				setSelectedComponent,
				currentPath,
				setCurrentPath,
				isLoading,
				error,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
