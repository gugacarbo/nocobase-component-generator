import { describe, it, expect } from "vitest";
import { ComponentAnalyzer } from "../../analyzers/ComponentAnalyzer";

describe("ComponentAnalyzer", () => {
	describe("findMainComponent()", () => {
		it("deve encontrar componente com export default", () => {
			const files = new Map<string, string>([
				[
					"component.tsx",
					`
					const MyComponent = () => <div>Hello</div>;
					const OtherComponent = () => <span>World</span>;

					export { OtherComponent };
					export default MyComponent;
				`,
				],
			]);

			const result = ComponentAnalyzer.findMainComponent(files);

			expect(result).toBe("MyComponent");
			expect(result).not.toBe("OtherComponent");
		});

		it("deve encontrar export default function", () => {
			const files = new Map<string, string>([
				[
					"component.tsx",
					`
					export default function MyComponent() {
						return <div>Hello</div>;
					}
					
					export function AnotherComponent() {
						return <span>World</span>;
					}
				`,
				],
			]);

			const result = ComponentAnalyzer.findMainComponent(files);

			expect(result).toBe("MyComponent");
			expect(result).not.toBe("AnotherComponent");
		});

		it("deve retornar último componente com export default em múltiplos arquivos", () => {
			const files = new Map<string, string>([
				[
					"app.tsx",
					`
					const App = () => <span>App</span>;
					export default App;
				`,
				],
				[
					"helper.tsx",
					`
					const Helper = () => <span>Helper</span>;
					export default Helper;
				`,
				],
				[
					"main.tsx",
					`
					const MainComponent = () => <div>Main</div>;
					export default MainComponent;
				`,
				],
			]);

			const result = ComponentAnalyzer.findMainComponent(files);

			expect(result).toBe("MainComponent");
			expect(result).not.toBe("Helper");
		});

		it("deve retornar erro se não encontrar componente", () => {
			const files = new Map<string, string>([
				["utils.ts", `export const helper = () => 42;`],
				["component", `export const Component = () => <div />;`],
				["app", `function App(){ return <span />; } export { App }`],
			]);

			try {
				const result = ComponentAnalyzer.findMainComponent(files);
				expect(result).toBeNull();
			} catch (err) {
				expect(err).toBeInstanceOf(Error);

				expect((err as Error).message).toBe(
					"Nenhum componente principal encontrado (export default)",
				);
			}
		});
	});
});
