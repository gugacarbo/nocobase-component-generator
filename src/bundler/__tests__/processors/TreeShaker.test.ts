import { describe, it, expect } from "vitest";
import { TreeShaker } from "../../processors/TreeShaker";

describe("TreeShaker", () => {
	describe("shake", () => {
		it("deve remover funções não utilizadas", () => {
			const code = `
function usedFn() { return 1; }
function unusedFn() { return 2; }
const result = usedFn();
`;
			const result = TreeShaker.shake(code, "Comp");

			expect(result).toContain("usedFn");
			expect(result).not.toContain("unusedFn");
		});

		it("deve remover variáveis não utilizadas", () => {
			const code = `
const usedVar = 1;
const unusedVar = 2;
console.log(usedVar);
`;
			const result = TreeShaker.shake(code, "Comp");

			expect(result).toContain("usedVar");
			expect(result).not.toContain("unusedVar");
		});

		it("deve preservar componente principal", () => {
			const code = `
const MyComponent = () => <div>Hello</div>;
const unusedHelper = () => 42;
`;
			const result = TreeShaker.shake(code, "MyComponent");

			expect(result).toContain("MyComponent");
			expect(result).not.toContain("unusedHelper");
		});

		it("deve preservar código quando não há declarações não utilizadas", () => {
			const code = `
const a = 1;
const b = a + 1;
console.log(b);
`;
			const result = TreeShaker.shake(code, "Comp");

			expect(result).toContain("const a = 1");
			expect(result).toContain("const b = a + 1");
		});

		it("deve lidar com erros graciosamente", () => {
			const invalidCode = `const {{{`;
			const result = TreeShaker.shake(invalidCode, "Comp");

			expect(result).toBe(invalidCode);
		});
	});

	describe("removeUnusedCode", () => {
		it("deve remover múltiplas declarações não utilizadas", () => {
			const code = `
const a = 1;
const b = 2;
const c = 3;
console.log(a);
`;
			const unused = new Set(["b", "c"]);
			const result = TreeShaker.removeUnusedCode(code, unused);

			expect(result).toContain("const a = 1");
			expect(result).not.toContain("const b = 2");
			expect(result).not.toContain("const c = 3");
		});

		it("deve remover classes não utilizadas", () => {
			const code = `
class UsedClass {}
class UnusedClass {}
new UsedClass();
`;
			const unused = new Set(["UnusedClass"]);
			const result = TreeShaker.removeUnusedCode(code, unused);

			expect(result).toContain("class UsedClass");
			expect(result).not.toContain("class UnusedClass");
		});

		it("deve normalizar linhas vazias após remoção", () => {
			const code = `
const a = 1;

const unused = 2;

const b = 3;
`;
			const unused = new Set(["unused"]);
			const result = TreeShaker.removeUnusedCode(code, unused);

			expect(result).not.toContain("\n\n\n");
		});
	});
});
