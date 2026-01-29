import { describe, it, expect } from "vitest";
import { FileLoader } from "../../processors/FileLoader";

describe("FileLoader", () => {
	describe("findFiles", () => {
		it("deve retornar array vazio para diretório inexistente", () => {
			const files = FileLoader.findFiles("/path/that/does/not/exist/xyz123");

			expect(files).toEqual([]);
		});
	});

	describe("loadFileInfo", () => {
		it("deve ter método loadFileInfo definido", () => {
			expect(typeof FileLoader.loadFileInfo).toBe("function");
		});
	});

	describe("loadDirectory", () => {
		it("deve ter método loadDirectory definido", () => {
			expect(typeof FileLoader.loadDirectory).toBe("function");
		});
	});

	describe("fileExists", () => {
		it("deve retornar false para arquivo inexistente", () => {
			const exists = FileLoader.fileExists("/path/that/does/not/exist.tsx");

			expect(exists).toBe(false);
		});
	});

	describe("directoryExists", () => {
		it("deve retornar false para diretório inexistente", () => {
			const exists = FileLoader.directoryExists("/path/that/does/not/exist");

			expect(exists).toBe(false);
		});
	});
});
