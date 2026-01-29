import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";

vi.mock("fs", async importOriginal => {
	const actual = await importOriginal<typeof import("fs")>();
	return {
		...actual,
		existsSync: vi.fn().mockReturnValue(false),
		statSync: vi.fn().mockReturnValue({ isDirectory: () => false }),
		mkdirSync: vi.fn(),
		writeFileSync: vi.fn(),
	};
});

describe("FileWriter", () => {
	let FileWriter: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import("../../processors/FileWriter");
		FileWriter = mod.FileWriter;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("ensureDirectory", () => {
		it("deve criar diretório se não existir", () => {
			(fs.existsSync as any).mockReturnValue(false);

			FileWriter.ensureDirectory("/output/test");

			expect(fs.mkdirSync).toHaveBeenCalled();
		});

		it("deve criar diretório se path existir mas não for diretório", () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.statSync as any).mockReturnValue({ isDirectory: () => false });

			FileWriter.ensureDirectory("/output/test");

			expect(fs.mkdirSync).toHaveBeenCalled();
		});
	});

	describe("writeFile", () => {
		it("deve escrever arquivo com conteúdo", () => {
			(fs.existsSync as any).mockReturnValue(false);

			FileWriter.writeFile("/output/test.jsx", "const a = 1;");

			expect(fs.writeFileSync).toHaveBeenCalledWith(
				"/output/test.jsx",
				"const a = 1;",
				"utf-8",
			);
		});

		it("deve criar diretório antes de escrever se não existir", () => {
			(fs.existsSync as any).mockReturnValue(false);

			FileWriter.writeFile("/output/deep/path/test.jsx", "content");

			expect(fs.mkdirSync).toHaveBeenCalled();
			expect(fs.writeFileSync).toHaveBeenCalled();
		});
	});
});
