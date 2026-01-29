import { describe, it, expect } from "vitest";
import { LibraryMapper } from "../../utils/LibraryMapper";

describe("LibraryMapper", () => {
	describe("getLibraryKey", () => {
		it("deve retornar chave correta para react", () => {
			const key = LibraryMapper.getLibraryKey("react");

			expect(key).toBe("React");
		});

		it("deve retornar chave correta para antd", () => {
			const key = LibraryMapper.getLibraryKey("antd");

			expect(key).toBe("antd");
		});

		it("deve retornar chave correta para @ant-design/icons", () => {
			const key = LibraryMapper.getLibraryKey("@ant-design/icons");

			expect(key).toBe("antdIcons");
		});

		it("deve retornar chave correta para @nocobase/client", () => {
			const key = LibraryMapper.getLibraryKey("@nocobase/client");

			expect(key).toBe("nocobase");
		});

		it("deve converter biblioteca desconhecida para PascalCase", () => {
			const key = LibraryMapper.getLibraryKey("unknown-library");

			expect(key).toBe("UnknownLibrary");
		});

		it("deve retornar chave para dayjs", () => {
			const key = LibraryMapper.getLibraryKey("dayjs");

			expect(key).toBe("dayjs");
		});

		it("deve retornar chave para lodash", () => {
			const key = LibraryMapper.getLibraryKey("lodash");

			expect(key).toBe("lodash");
		});
	});

	describe("generateAllDestructuring", () => {
		it("deve gerar destructuring para bibliotecas fornecidas", () => {
			const libraries = new Map<string, Set<string>>();
			libraries.set("react", new Set(["useState", "useEffect"]));

			const result = LibraryMapper.generateAllDestructuring(libraries);

			expect(result.length).toBe(1);
			expect(result[0]).toContain("ctx.libs.React");
			expect(result[0]).toContain("useState");
			expect(result[0]).toContain("useEffect");
		});

		it("deve gerar múltiplas linhas para múltiplas bibliotecas", () => {
			const libraries = new Map<string, Set<string>>();
			libraries.set("react", new Set(["useState"]));
			libraries.set("antd", new Set(["Button"]));

			const result = LibraryMapper.generateAllDestructuring(libraries);

			expect(result.length).toBe(2);
		});

		it("deve gerar código válido de destructuring", () => {
			const libraries = new Map<string, Set<string>>();
			libraries.set("antd", new Set(["Button", "Input"]));

			const result = LibraryMapper.generateAllDestructuring(libraries);

			expect(result[0]).toContain("const {");
			expect(result[0]).toContain("} =");
		});

		it("deve retornar array vazio para mapa vazio", () => {
			const libraries = new Map<string, Set<string>>();

			const result = LibraryMapper.generateAllDestructuring(libraries);

			expect(result).toHaveLength(0);
		});
	});
});
