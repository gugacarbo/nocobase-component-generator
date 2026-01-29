import { describe, it, expect } from "vitest";
import { CodeAnalyzer } from "../../analyzers/CodeAnalyzer";

describe("CodeAnalyzer", () => {
	describe("analyzeDeclared()", () => {
		it("deve identificar declarações de variáveis", () => {
			const code = `
				const myVar = 1;
				let anotherVar = 2;
				var oldVar = 3;
			`;

			const declared = CodeAnalyzer.analyzeDeclared(code);

			expect(declared.has("myVar")).toBe(true);
			expect(declared.has("anotherVar")).toBe(true);
			expect(declared.has("oldVar")).toBe(true);
			expect(declared.has("noDeclaredVar")).toBe(false);
		});

		it("deve identificar declarações de funções", () => {
			const code = `
				function myFunction() {}
				const arrowFn = () => {};
			`;

			const declared = CodeAnalyzer.analyzeDeclared(code);

			expect(declared.has("myFunction")).toBe(true);
			expect(declared.has("arrowFn")).toBe(true);
			expect(declared.has("noFunction")).toBe(false);
		});

		it("deve identificar declarações de classes", () => {
			const code = `
				class MyClass {}
			`;

			const declared = CodeAnalyzer.analyzeDeclared(code);

			expect(declared.has("MyClass")).toBe(true);
			expect(declared.has("NoClass")).toBe(false);
		});

		it("deve identificar interfaces e types", () => {
			const code = `
				interface MyInterface {}
				type MyType = string;
			`;

			const declared = CodeAnalyzer.analyzeDeclared(code);

			expect(declared.has("MyInterface")).toBe(true);
			expect(declared.has("MyType")).toBe(true);
			expect(declared.has("NoInterface")).toBe(false);
		});

		it("deve identificar enums", () => {
			const code = `
				enum MyEnum { A, B, C }
			`;

			const declared = CodeAnalyzer.analyzeDeclared(code);
			expect(declared.has("MyEnum")).toBe(true);
			expect(declared.has("NoEnum")).toBe(false);
		});
	});

	describe("analyzeUsage()", () => {
		it("deve identificar identificadores usados", () => {
			const code = `
				const result = myFunction(param1, param2);
				console.log(result);
			`;

			const used = CodeAnalyzer.analyzeUsage(code);

			expect(used.has("myFunction")).toBe(true);
			expect(used.has("param1")).toBe(true);
			expect(used.has("param2")).toBe(true);
			expect(used.has("console")).toBe(true);
			expect(used.has("result")).toBe(true);
		});

		it("deve identificar identificadores em imports", () => {
			const code = `
				import { useState } from 'react';
				const [state, setState] = useState(0);
			`;

			const used = CodeAnalyzer.analyzeUsage(code);

			expect(used.has("useState")).toBe(true);
			expect(used.has("setState")).toBe(true);
			expect(used.has("state")).toBe(true);
		});
	});

	describe("findUnusedDeclarations()", () => {
		it("deve encontrar declarações não utilizadas", () => {
			const code = `
				const usedVar = 1;
				const unusedVar = 2;
				
				console.log(usedVar);

				function usedFunction() { return usedVar; }
				function unusedFunction() { return usedVar; }
				
				usedFunction();
			
				const unusedArrowFn = () => {};
				const usedArrowFn = () => { return usedVar; };
			
				const abc = usedArrowFn();
			`;

			const unused = CodeAnalyzer.findUnusedDeclarations(code, "MainComponent");

			expect(unused.has("unusedVar")).toBe(true);
			expect(unused.has("usedVar")).toBe(false);

			expect(unused.has("unusedFunction")).toBe(true);
			expect(unused.has("usedFunction")).toBe(false);

			expect(unused.has("unusedArrowFn")).toBe(true);
			expect(unused.has("usedArrowFn")).toBe(false);
		});

		it("não deve marcar o componente principal como não utilizado", () => {
			const component = "MyComponent";

			const code = `
				const ${component} = () => <div>Hello</div>;
			`;

			const unused = CodeAnalyzer.findUnusedDeclarations(code, component);

			expect(unused.has(component)).toBe(false);
		});

		it("deve encontrar componentes não utilizados", () => {
			const component = "MyComponent";

			const code = `
				const ${component} = () => <div>Hello</div>;
				const AnotherComponent = () => <div>World</div>;
				`;

			const unused = CodeAnalyzer.findUnusedDeclarations(code, component);

			expect(unused.has(component)).toBe(false);
			expect(unused.has("AnotherComponent")).toBe(true);
		});

		it("deve encontrar funções não utilizadas", () => {
			const code = `
				function usedFn() { return 1; }
				function unusedFn() { return 2; }
				const result = usedFn();
			`;

			const unused = CodeAnalyzer.findUnusedDeclarations(code, "MainComponent");

			expect(unused.has("unusedFn")).toBe(true);
			expect(unused.has("usedFn")).toBe(false);
		});
	});
});
