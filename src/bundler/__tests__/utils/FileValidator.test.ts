import { describe, it, expect } from "vitest";
import { FileValidator } from "../../utils/FileValidator";

describe("FileValidator", () => {
	describe("shouldExcludeFile", () => {
		it("deve excluir arquivos main.tsx", () => {
			expect(FileValidator.shouldExcludeFile("main.tsx")).toBe(true);
		});

		it("deve excluir arquivos App.tsx", () => {
			expect(FileValidator.shouldExcludeFile("App.tsx")).toBe(true);
		});

		it("deve excluir arquivos index.ts", () => {
			expect(FileValidator.shouldExcludeFile("index.ts")).toBe(true);
		});

		it("não deve excluir arquivos normais .tsx", () => {
			expect(FileValidator.shouldExcludeFile("Component.tsx")).toBe(false);
		});

		it("não deve excluir arquivos normais .ts", () => {
			expect(FileValidator.shouldExcludeFile("utils.ts")).toBe(false);
		});
	});

	describe("shouldExcludeDir", () => {
		it("deve excluir node_modules", () => {
			expect(FileValidator.shouldExcludeDir("node_modules")).toBe(true);
		});

		it("deve excluir output", () => {
			expect(FileValidator.shouldExcludeDir("output")).toBe(true);
		});

		it("deve excluir dist", () => {
			expect(FileValidator.shouldExcludeDir("dist")).toBe(true);
		});

		it("deve excluir .git", () => {
			expect(FileValidator.shouldExcludeDir(".git")).toBe(true);
		});

		it("não deve excluir diretórios normais", () => {
			expect(FileValidator.shouldExcludeDir("components")).toBe(false);
		});

		it("não deve excluir diretórios src", () => {
			expect(FileValidator.shouldExcludeDir("src")).toBe(false);
		});

		it("não deve excluir diretórios utils", () => {
			expect(FileValidator.shouldExcludeDir("utils")).toBe(false);
		});
	});

	describe("isSupportedFile", () => {
		it("deve suportar arquivos .ts", () => {
			expect(FileValidator.isSupportedFile("utils.ts")).toBe(true);
		});

		it("deve suportar arquivos .tsx", () => {
			expect(FileValidator.isSupportedFile("Component.tsx")).toBe(true);
		});

		it("deve suportar arquivos .js", () => {
			expect(FileValidator.isSupportedFile("script.js")).toBe(true);
		});

		it("deve suportar arquivos .jsx", () => {
			expect(FileValidator.isSupportedFile("Component.jsx")).toBe(true);
		});

		it("não deve suportar arquivos .css", () => {
			expect(FileValidator.isSupportedFile("styles.css")).toBe(false);
		});

		it("não deve suportar arquivos .json", () => {
			expect(FileValidator.isSupportedFile("package.json")).toBe(false);
		});

		it("não deve suportar arquivos .md", () => {
			expect(FileValidator.isSupportedFile("README.md")).toBe(false);
		});
	});

	describe("isMockOrTestFile", () => {
		it("deve identificar arquivos de teste (.test.ts)", () => {
			expect(FileValidator.isMockOrTestFile("component.test.ts")).toBe(true);
		});

		it("deve identificar arquivos de teste (.test.tsx)", () => {
			expect(FileValidator.isMockOrTestFile("component.test.tsx")).toBe(true);
		});

		it("deve identificar arquivos de spec (.spec.ts)", () => {
			expect(FileValidator.isMockOrTestFile("component.spec.ts")).toBe(true);
		});

		it("deve identificar arquivos mock (.mock.ts)", () => {
			expect(FileValidator.isMockOrTestFile("service.mock.ts")).toBe(true);
		});

		it("não deve identificar arquivos normais", () => {
			expect(FileValidator.isMockOrTestFile("component.tsx")).toBe(false);
		});
	});

	describe("shouldIgnoreModule", () => {
		it("não deve ignorar módulos comuns por padrão", () => {
			expect(FileValidator.shouldIgnoreModule("react")).toBe(false);
		});

		it("não deve ignorar antd", () => {
			expect(FileValidator.shouldIgnoreModule("antd")).toBe(false);
		});
	});
});
