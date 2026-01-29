import { describe, it, expect } from "vitest";
import { CommentProcessor } from "../../processors/CommentProcessor";

describe("CommentProcessor", () => {
	describe("processComments", () => {
		it("deve processar linhas com //bundle-only:", () => {
			const code = `
const a = 1;
//bundle-only: const b = 2;
const c = 3;
`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("const a = 1");
			expect(result).toContain("const b = 2");
			expect(result).toContain("const c = 3");
			expect(result).not.toContain("//bundle-only:");
		});

		it("deve remover linhas com //no-bundle", () => {
			const code = `
const a = 1;
const b = 2; //no-bundle
const c = 3;
`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("const a = 1");
			expect(result).not.toContain("const b = 2");
			expect(result).toContain("const c = 3");
		});

		it("deve remover comentários inline", () => {
			const code = `
const a = 1; // inline comment
const b = 2;
`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("const a = 1");
			expect(result).not.toContain("// inline comment");
		});

		it("deve remover comentários multilinha", () => {
			const code = `
const a = 1;
/* This is a
multiline comment */
const b = 2;
`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("const a = 1");
			expect(result).toContain("const b = 2");
			expect(result).not.toContain("multiline comment");
		});

		it("deve preservar URLs (http://)", () => {
			const code = `const url = "http://example.com";`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("http://example.com");
		});

		it("deve preservar URLs (https://)", () => {
			const code = `const url = "https://example.com";`;
			const result = CommentProcessor.processComments(code);

			expect(result).toContain("https://example.com");
		});

		it("deve preservar indentação em //bundle-only:", () => {
			const code = `
function test() {
    //bundle-only: return true;
}
`;
			const result = CommentProcessor.processComments(code);

			expect(result).toMatch(/\s{4}return true;/);
		});
	});
});
