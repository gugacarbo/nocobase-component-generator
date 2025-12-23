import * as ts from "typescript";
import { Logger } from "@common/Logger";

export class ComponentAnalyzer {
	// [ Encontra o componente principal (último componente com export default) ]
	public static findMainComponent(files: Map<string, string>): string | null {
		let mainComponent: string | null = null;

		// Verifica arquivos em ordem reversa
		const filesArray = Array.from(files.entries()).reverse();

		// Primeiro: procura por export default
		for (const [_, content] of filesArray) {
			if (content.includes("export default")) {
				const componentName = this.extractExportedComponent(content);
				if (componentName) {
					mainComponent = componentName;
					break;
				}
			}
		}

		// Segundo: procura por qualquer componente React
		if (!mainComponent) {
			for (const [_, content] of filesArray) {
				const components = this.findReactComponents(content);
				if (components.length > 0) {
					mainComponent = components[0];
					break;
				}
			}
		}

		if (!mainComponent) {
			Logger.warning("Nenhum componente principal encontrado");
		}

		return mainComponent;
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
			"temp.tsx",
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
						if (this.isComponentName(name)) {
							components.push(name);
						}
					}
				});
			}

			// Function components: function MyComponent() {}
			else if (ts.isFunctionDeclaration(node) && node.name) {
				const name = node.name.text;
				if (this.isComponentName(name)) {
					components.push(name);
				}
			}

			// Class components: class MyComponent extends React.Component
			else if (ts.isClassDeclaration(node) && node.name) {
				const name = node.name.text;
				if (this.isComponentName(name)) {
					components.push(name);
				}
			}

			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return components;
	}

	/**
	 * Verifica se um nome é de componente React (PascalCase)
	 */
	private static isComponentName(name: string): boolean {
		return name.length > 0 && name[0] === name[0].toUpperCase();
	}
}
