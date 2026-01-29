import { Logger } from "@common/Logger";

/**
 * Analisador especializado em componentes React
 */
export class ComponentAnalyzer {
	/**
	 * Encontra o componente principal (último componente com export default)
	 */
	public static findMainComponent(files: Map<string, string>): string {
		const filesArray = Array.from(files.entries()).reverse();

		// Primeiro: procura por export default
		for (const [_, content] of filesArray) {
			if (content.includes("export default")) {
				const componentName = this.extractExportedComponent(content);
				if (componentName) {
					Logger.success.verbose(
						`Componente principal encontrado: ${componentName}`,
					);
					return componentName;
				}
			}
		}

		Logger.error("Nenhum componente principal encontrado");

		throw new Error("Nenhum componente principal encontrado (export default)");
	}

	/**
	 * Extrai o nome do componente exportado como default
	 */
	private static extractExportedComponent(content: string): string | null {
		// export default function MyComponent (verificar ANTES de export default X)
		const funcMatch = content.match(/export\s+default\s+function\s+(\w+)/);
		if (funcMatch) {
			return funcMatch[1];
		}

		// export default MyComponent (nome direto, não function/class)
		const directMatch = content.match(/export\s+default\s+([A-Z]\w*)/);
		if (directMatch) {
			return directMatch[1];
		}

		// const MyComponent = ... \n export default MyComponent
		const constMatch = content.match(
			/const\s+(\w+)\s*[:=].*export\s+default\s+\1/s,
		);
		if (constMatch) {
			return constMatch[1];
		}

		return null;
	}
}
