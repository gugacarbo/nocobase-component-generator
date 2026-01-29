import { describe, it, expect } from "vitest";
import { TypeScriptRemover } from "../../processors/TypeScriptRemover";

describe("TypeScriptRemover", () => {
	describe("removeTypes", () => {
		it("deve remover interfaces", () => {
			const code = `
interface Props {
	title: string;
	count: number;
}

const a = 1;
`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain("interface Props");
			expect(result).toContain("const a = 1");
		});

		it("deve remover type aliases", () => {
			const code = `
type MyType = string | number;
const value = 'test';
`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain("type MyType");
			expect(result).toContain("const value");
		});

		it("deve remover anotações de tipo em variáveis", () => {
			const code = `const name: string = 'test';`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain(": string");
			expect(result).toContain("const name");
		});

		it("deve remover anotações de tipo em parâmetros de função", () => {
			const code = `function greet(name: string): void { console.log(name); }`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain(": string");
			expect(result).not.toContain(": void");
			expect(result).toContain("function greet(name)");
		});

		it("deve preservar JSX", () => {
			const code = `const Component = () => <div className="test">Hello</div>;`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).toContain('<div className="test">Hello</div>');
		});

		it("deve remover generics", () => {
			const code = `const arr: Array<string> = [];`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain("Array<string>");
			expect(result).toContain("const arr");
		});

		it("deve lidar com código válido sem erros", () => {
			const validCode = "const a = 1;";
			const result = TypeScriptRemover.removeTypes(validCode, "test.tsx");

			expect(result).toContain("const a = 1");
		});

		it("deve remover enums", () => {
			const code = `
enum Status {
	Active,
	Inactive
}
const s = Status.Active;
`;
			const result = TypeScriptRemover.removeTypes(code, "test.tsx");

			expect(result).not.toContain("enum Status");
		});
	});
});
