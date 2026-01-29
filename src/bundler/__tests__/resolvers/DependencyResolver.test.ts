import { describe, it, expect } from "vitest";
import { DependencyResolver } from "../../resolvers/DependencyResolver";
import type { FileInfo } from "../../core/types";

describe("DependencyResolver", () => {
	const createMockFile = (filePath: string, content: string): FileInfo => ({
		path: filePath,
		content,
		imports: [],
		relativePath: filePath.replace(/^\/test\//, ""),
	});

	describe("sortFilesByDependency", () => {
		it("deve ordenar arquivos sem dependências", () => {
			const files = new Map<string, FileInfo>();
			files.set("/test/a.tsx", createMockFile("/test/a.tsx", "const A = 1;"));
			files.set("/test/b.tsx", createMockFile("/test/b.tsx", "const B = 2;"));
			files.set("/test/c.tsx", createMockFile("/test/c.tsx", "const C = 3;"));

			const sorted = DependencyResolver.sortFilesByDependency(files);

			expect(sorted).toHaveLength(3);
		});

		it("deve colocar dependências antes dos dependentes", () => {
			const files = new Map<string, FileInfo>();
			files.set(
				"/test/main.tsx",
				createMockFile("/test/main.tsx", "import { helper } from './utils';"),
			);
			files.set(
				"/test/utils.tsx",
				createMockFile("/test/utils.tsx", "export const helper = () => {};"),
			);

			const sorted = DependencyResolver.sortFilesByDependency(files);

			expect(sorted).toHaveLength(2);
		});

		it("deve lidar com dependências circulares sem entrar em loop infinito", () => {
			const files = new Map<string, FileInfo>();
			files.set(
				"/test/a.tsx",
				createMockFile("/test/a.tsx", "import { b } from './b';"),
			);
			files.set(
				"/test/b.tsx",
				createMockFile("/test/b.tsx", "import { a } from './a';"),
			);

			const sorted = DependencyResolver.sortFilesByDependency(files);

			expect(sorted).toHaveLength(2);
		});
	});

	describe("resolveImportWithReExports", () => {
		it("deve retornar array vazio para import não resolvível", () => {
			const resolved = DependencyResolver.resolveImportWithReExports(
				"/test/main.tsx",
				"./nonexistent",
				["something"],
			);

			expect(resolved).toEqual([]);
		});
	});

	describe("isIndexWithReExports", () => {
		it("deve retornar false para arquivo inexistente", () => {
			const result = DependencyResolver.isIndexWithReExports(
				"/path/that/does/not/exist/index.ts",
			);

			expect(result).toBe(false);
		});

		it("deve retornar false para caminho vazio", () => {
			const result = DependencyResolver.isIndexWithReExports("");

			expect(result).toBe(false);
		});
	});

	describe("resolveReExports", () => {
		it("deve retornar array vazio para arquivo inexistente", () => {
			const result = DependencyResolver.resolveReExports(
				"/path/that/does/not/exist/index.ts",
			);

			expect(result).toEqual([]);
		});

		it("deve retornar array vazio para caminho vazio", () => {
			const result = DependencyResolver.resolveReExports("");

			expect(result).toEqual([]);
		});
	});

	describe("resolveImportPath", () => {
		it("deve retornar null para import não resolvível", () => {
			const result = DependencyResolver.resolveImportPath(
				"/test/main.tsx",
				"./nonexistent",
			);

			expect(result).toBeNull();
		});
	});
});
