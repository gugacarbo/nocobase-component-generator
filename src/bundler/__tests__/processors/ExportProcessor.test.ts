import { describe, it, expect } from "vitest";
import { ExportProcessor } from "../../processors/ExportProcessor";

describe("ExportProcessor", () => {
	describe("removeExports", () => {
		it("deve remover export default com identificador", () => {
			const code = `
const MyComponent = () => <div>Hello</div>;
export default MyComponent;
`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toMatch(/export\s+default\s+MyComponent/);
			expect(result).toContain("MyComponent");
		});

		it("deve remover export default inline", () => {
			const code = `export default function MyComponent() { return <div>Hello</div>; }`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export default");
			expect(result).toContain("function MyComponent");
		});

		it("deve remover export named", () => {
			const code = `export const myVar = 1;`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export");
			expect(result).toContain("const myVar");
		});

		it("deve remover export de função", () => {
			const code = `export function myFunction() { return 1; }`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export");
			expect(result).toContain("function myFunction");
		});

		it("deve remover export de classe", () => {
			const code = `export class MyClass { }`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export");
			expect(result).toContain("class MyClass");
		});

		it("deve remover export async function", () => {
			const code = `export async function fetchData() { return null; }`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export");
			expect(result).toContain("async function fetchData");
		});

		it("deve remover export block { ... }", () => {
			const code = `
const a = 1;
const b = 2;
export { a, b };
`;
			const result = ExportProcessor.removeExports(code);

			expect(result).not.toContain("export {");
			expect(result).toContain("const a = 1");
			expect(result).toContain("const b = 2");
		});

		it("deve preservar código não exportado", () => {
			const code = `
const internal = 'private';
export const external = 'public';
`;
			const result = ExportProcessor.removeExports(code);

			expect(result).toContain("const internal = 'private'");
			expect(result).toContain("const external = 'public'");
		});
	});

	describe("extractDefaultProps", () => {
		it("deve extrair defaultProps simples", () => {
			const code = `
const defaultProps = {
	title: 'Hello',
};

const Component = () => <div />;
`;
			const result = ExportProcessor.extractDefaultProps(code);

			expect(result.defaultProps).toContain("defaultProps");
			expect(result.defaultProps).toContain("title: 'Hello'");
			expect(result.contentWithout).toContain("Component");
			expect(result.contentWithout).not.toContain("defaultProps = {");
		});

		it("deve extrair defaultProps com export", () => {
			const code = `export const defaultProps = { title: 'Hi' };`;
			const result = ExportProcessor.extractDefaultProps(code);

			expect(result.defaultProps).toBe("const defaultProps = { title: 'Hi' };");
			expect(result.defaultProps).not.toContain("export");
		});

		it("deve retornar vazio quando não há defaultProps", () => {
			const code = `const Component = () => <div />;`;
			const result = ExportProcessor.extractDefaultProps(code);

			expect(result.defaultProps).toBe("");
			expect(result.contentWithout).toBe(code);
		});
	});

	describe("reorderDefaultProps", () => {
		it("deve mover defaultProps para o início", () => {
			const code = `
const Component = () => <div />;

const defaultProps = {
	title: 'Hello',
};
`;
			const result = ExportProcessor.reorderDefaultProps(code);

			const defaultPropsIndex = result.indexOf("defaultProps");
			const componentIndex = result.indexOf("Component");

			expect(defaultPropsIndex).toBeLessThan(componentIndex);
		});

		it("deve preservar código quando não há defaultProps", () => {
			const code = `const Component = () => <div />;`;
			const result = ExportProcessor.reorderDefaultProps(code);

			expect(result).toBe(code);
		});
	});
});
