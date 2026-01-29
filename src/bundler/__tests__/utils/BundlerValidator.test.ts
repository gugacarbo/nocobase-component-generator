import { describe, it, expect, vi } from "vitest";
import { BundlerValidator } from "../../utils/BundlerValidator";
import { FileLoader } from "../../processors/FileLoader";

vi.mock("../../processors/FileLoader", () => ({
	FileLoader: {
		fileExists: vi.fn(),
		directoryExists: vi.fn(),
	},
}));

describe("BundlerValidator", () => {
	describe("validateInputs", () => {
		it("deve validar entrada com caminho de diretório válido", () => {
			(FileLoader.directoryExists as any).mockReturnValue(true);
			(FileLoader.fileExists as any).mockReturnValue(false);

			const result = BundlerValidator.validateInputs(
				"/components/test",
				"/output",
			);

			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it("deve falhar quando srcPath está vazio", () => {
			const result = BundlerValidator.validateInputs("", "/output");

			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("deve falhar quando outputDir está vazio", () => {
			(FileLoader.directoryExists as any).mockReturnValue(true);
			(FileLoader.fileExists as any).mockReturnValue(false);

			const result = BundlerValidator.validateInputs("/components", "");

			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("deve falhar quando srcPath é undefined", () => {
			const result = BundlerValidator.validateInputs(
				undefined as any,
				"/output",
			);

			expect(result.isValid).toBe(false);
		});

		it("deve falhar quando path não existe", () => {
			(FileLoader.directoryExists as any).mockReturnValue(false);
			(FileLoader.fileExists as any).mockReturnValue(false);

			const result = BundlerValidator.validateInputs(
				"/path/not/found",
				"/output",
			);

			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes("não encontrado"))).toBe(true);
		});
	});

	describe("validateBundle", () => {
		it("deve validar bundle com componente válido", () => {
			const bundleContent = `
const Component = () => <div>Hello</div>;
export default Component;
`;

			const result = BundlerValidator.validateBundle(bundleContent);

			expect(result.isValid).toBe(true);
		});

		it("deve falhar para bundle vazio", () => {
			const result = BundlerValidator.validateBundle("");

			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("deve falhar para bundle só com espaços em branco", () => {
			const result = BundlerValidator.validateBundle("   \n\t\n   ");

			expect(result.isValid).toBe(false);
		});

		it("deve validar bundle com múltiplos componentes", () => {
			const bundleContent = `
const Helper = () => <span />;
const Main = () => <div><Helper /></div>;
export default Main;
`;

			const result = BundlerValidator.validateBundle(bundleContent);

			expect(result.isValid).toBe(true);
		});

		it("deve identificar warnings quando não há export default nem ctx.render", () => {
			const bundleContent = `
const Component = () => <div />;
`;

			const result = BundlerValidator.validateBundle(bundleContent);

			expect(result.warnings?.length).toBeGreaterThan(0);
		});
	});

	describe("validateLoadedFiles", () => {
		it("deve validar quando há arquivos carregados", () => {
			const files = new Map([["file.tsx", { content: "code" }]]);

			const result = BundlerValidator.validateLoadedFiles(files);

			expect(result.isValid).toBe(true);
		});

		it("deve falhar quando não há arquivos", () => {
			const files = new Map();

			const result = BundlerValidator.validateLoadedFiles(files);

			expect(result.isValid).toBe(false);
			expect(result.errors.some(e => e.includes("Nenhum arquivo"))).toBe(true);
		});
	});

	describe("logValidation", () => {
		it("deve ter método logValidation definido", () => {
			expect(typeof BundlerValidator.logValidation).toBe("function");
		});
	});
});
