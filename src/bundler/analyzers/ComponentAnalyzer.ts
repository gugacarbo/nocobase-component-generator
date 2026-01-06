import * as ts from "typescript";
import { Logger } from "@common/Logger";
import { APP_CONFIG } from "@/config/config";
import { StringUtils } from "@common/utils";

/**
 * Analisador especializado em componentes React
 */
export class ComponentAnalyzer {
	/**
	 * Encontra o componente principal (último componente com export default)
	 */
	public static findMainComponent(files: Map<string, string>): string | null {
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

		// Segundo: procura por qualquer componente React
		for (const [_, content] of filesArray) {
			const components = this.findReactComponents(content);
			if (components.length > 0) {
				Logger.info.verbose(`Componente React encontrado: ${components[0]}`);
				return components[0];
			}
		}

		Logger.warning("Nenhum componente principal encontrado");
		return null;
	}

	/**
	 * Extrai o nome do componente exportado como default
	 */
	private static extractExportedComponent(content: string): string | null {
		// export default MyComponent
		const directMatch = content.match(/export\s+default\s+(\w+)/);
		if (directMatch) {
			return directMatch[1];
		}

		// export default function MyComponent
		const funcMatch = content.match(/export\s+default\s+function\s+(\w+)/);
		if (funcMatch) {
			return funcMatch[1];
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

	/**
	 * Encontra todos os componentes React no código
	 */
	public static findReactComponents(content: string): string[] {
		const components: string[] = [];
		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			// Componentes funcionais: const MyComponent = () => {}
			if (ts.isVariableStatement(node)) {
				node.declarationList.declarations.forEach(decl => {
					if (ts.isIdentifier(decl.name)) {
						const name = decl.name.text;
						if (StringUtils.isPascalCase(name)) {
							components.push(name);
						}
					}
				});
			}

			// Function components: function MyComponent() {}
			else if (ts.isFunctionDeclaration(node) && node.name) {
				const name = node.name.text;
				if (StringUtils.isPascalCase(name)) {
					components.push(name);
				}
			}

			// Class components: class MyComponent extends React.Component
			else if (ts.isClassDeclaration(node) && node.name) {
				const name = node.name.text;
				if (StringUtils.isPascalCase(name)) {
					components.push(name);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return components;
	}
}
