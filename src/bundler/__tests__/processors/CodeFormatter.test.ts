import { describe, it, expect } from "vitest";
import { CodeFormatter } from "../../processors/CodeFormatter";

describe("CodeFormatter", () => {
	describe("format", () => {
		it("deve formatar código com prettier", async () => {
			const code = `const   a  =  1;`;
			const result = await CodeFormatter.format(code, true);

			expect(result).toBeTruthy();
			expect(typeof result).toBe("string");
		});

		it("deve usar formatação básica como fallback em caso de erro", async () => {
			const invalidCode = `const {{{ invalid`;
			const result = await CodeFormatter.format(invalidCode, true);

			expect(typeof result).toBe("string");
		});
	});

	describe("formatBasic", () => {
		it("deve remover linhas vazias consecutivas excessivas", () => {
			const code = `const a = 1;



const b = 2;`;

			const result = CodeFormatter.formatBasic(code);

			expect(result).not.toContain("\n\n\n");
		});

		it("deve preservar indentação", () => {
			const code = `function test() {
	const a = 1;
	if (a) {
		console.log(a);
	}
}`;

			const result = CodeFormatter.formatBasic(code);

			expect(result).toContain("\tconst a = 1;");
			expect(result).toContain("\t\tconsole.log(a);");
		});

		it("deve remover espaços em branco no final das linhas", () => {
			const code = `const a = 1;   
const b = 2;	 
const c = 3;`;

			const result = CodeFormatter.formatBasic(code);
			const lines = result.split("\n");

			lines.forEach(line => {
				expect(line).toBe(line.trimEnd());
			});
		});

		it("deve garantir linha vazia no final", () => {
			const code = "const a = 1;";

			const result = CodeFormatter.formatBasic(code);

			expect(result.endsWith("\n")).toBe(true);
		});
	});
});
