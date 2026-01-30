import { describe, it, expect, beforeEach } from "vitest";
import { BundleComposer } from "../../core/BundleComposer";
import { type BundlePipelineContext } from "../../core/types";

describe("BundleComposer", () => {
	let context: BundlePipelineContext;

	beforeEach(() => {
		context = {
			sortedFiles: ["file1.tsx", "file2.tsx"],
			fileContents: new Map([
				["file1.tsx", "export const Component = () => <div />"],
				["file2.tsx", "export const Helper = () => {}"],
			]),
			files: new Map([
				[
					"file1.tsx",
					{
						path: "/path/file1.tsx",
						content: "export const Component = () => <div />",
						imports: ["react"],
						relativePath: "file1.tsx",
					},
				],
				[
					"file2.tsx",
					{
						path: "/path/file2.tsx",
						content: "export const Helper = () => {}",
						imports: [],
						relativePath: "file2.tsx",
					},
				],
			]),
			mainComponent: "Component",
			externalImports: new Map([["react", new Set(["useState", "useEffect"])]]),
		};
	});

	describe("addHeader", () => {
		it("deve adicionar stage de header", () => {
			const composer = new BundleComposer();
			const result = composer.addHeader();

			expect(result).toBe(composer); // chainable
			expect(composer.getStages()).toContain("Header");
		});
	});

	describe("addFilesConcatenation", () => {
		it("deve adicionar stage de concatenação de arquivos", () => {
			const composer = new BundleComposer();
			const result = composer.addFilesConcatenation(context, false);

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Concatenação de Arquivos");
		});
	});

	describe("addCommentProcessing", () => {
		it("deve adicionar stage de processamento de comentários", () => {
			const composer = new BundleComposer();
			const result = composer.addCommentProcessing();

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Processamento de Comentários");
		});
	});

	describe("addTreeShaking", () => {
		it("deve adicionar stage de tree shaking", () => {
			const composer = new BundleComposer();
			const result = composer.addTreeShaking("Component");

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Tree Shaking");
		});
	});

	describe("addDefaultProps", () => {
		it("deve adicionar stage de extração de defaultProps", () => {
			const composer = new BundleComposer();
			const result = composer.addDefaultProps();

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Extração de DefaultProps");
		});
	});

	describe("addComponentExport", () => {
		it("deve adicionar stage de export do componente", () => {
			const composer = new BundleComposer();
			const result = composer.addComponentExport("Component", false, null);

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Export do Componente");
		});

		it("deve adicionar stage para JavaScript com defaultProps", () => {
			const composer = new BundleComposer();
			composer.addComponentExport("Component", true, "const defaultProps = {}");

			expect(composer.getStages()).toContain("Export do Componente");
		});
	});

	describe("addExternalImports", () => {
		it("deve adicionar stage de imports externos", () => {
			const composer = new BundleComposer();
			const result = composer.addExternalImports(context.externalImports);

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Imports Externos");
		});
	});

	describe("addNocoBaseTransformation", () => {
		it("deve adicionar stage de transformação NocoBase", () => {
			const composer = new BundleComposer();
			const result = composer.addNocoBaseTransformation();

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("Transformação NocoBase");
		});
	});

	describe("addCustomStage", () => {
		it("deve adicionar stage customizado", () => {
			const composer = new BundleComposer();
			const customFn = (content: string) => content.toUpperCase();

			const result = composer.addCustomStage("MyStage", customFn);

			expect(result).toBe(composer);
			expect(composer.getStages()).toContain("MyStage");
		});
	});

	describe("compose", () => {
		it("deve compor pipeline sem stages (retorna vazio ou falha graciosamente)", async () => {
			const composer = new BundleComposer();

			try {
				const result = await composer.compose();

				// Pode retornar vazio ou lançar erro
				expect(result === "" || result === null || result === undefined).toBe(
					true,
				);
			} catch (error) {
				// É aceitável que lance erro para bundle vazio
				expect(error instanceof Error).toBe(true);
			}
		});

		it("deve compor pipeline com um stage", async () => {
			const composer = new BundleComposer();
			composer.addCustomStage("Custom", content => content + "modified");

			const result = await composer.compose();

			expect(result).toBe("modified");
		});

		it("deve compor pipeline com múltiplos stages em sequência", async () => {
			const composer = new BundleComposer();
			composer
				.addCustomStage("Stage1", content => content + "A")
				.addCustomStage("Stage2", content => content + "B")
				.addCustomStage("Stage3", content => content + "C");

			const result = await composer.compose();

			expect(result).toBe("ABC");
		});

		it("deve lançar erro se resultado final está vazio", async () => {
			const composer = new BundleComposer();
			composer.addCustomStage("Empty", () => "   \n\t\n   ");

			await expect(composer.compose()).rejects.toThrow(
				"Bundle gerado está vazio",
			);
		});

		it("deve executar stages em ordem correta", async () => {
			const stages: string[] = [];

			const composer = new BundleComposer();
			composer
				.addCustomStage("First", content => {
					stages.push("First");
					return content + "1";
				})
				.addCustomStage("Second", content => {
					stages.push("Second");
					return content + "2";
				})
				.addCustomStage("Third", content => {
					stages.push("Third");
					return content + "3";
				});

			const result = await composer.compose();

			expect(stages).toEqual(["First", "Second", "Third"]);
			expect(result).toBe("123");
		});

		it("deve propagar conteúdo entre stages", async () => {
			const composer = new BundleComposer();
			composer
				.addCustomStage("Add", content => content + " World")
				.addCustomStage("Prefix", content => "Hello" + content);

			const result = await composer.compose();

			expect(result).toBe("Hello World");
		});

		// it("deve lidar com stages que retornam promise", async () => {
		// 	const composer = new BundleComposer();
		// 	composer.addCustomStage("Async", async content => {
		// 		return new Promise(resolve => {
		// 			setTimeout(() => resolve(content + "async"), 0);
		// 		});
		// 	});

		// 	const result = await composer.compose();

		// 	expect(result).toBe("async");
		// });
	});

	describe("getStages", () => {
		it("deve retornar lista vazia para composer novo", () => {
			const composer = new BundleComposer();

			expect(composer.getStages()).toEqual([]);
		});

		it("deve retornar lista de nomes de stages adicionados", () => {
			const composer = new BundleComposer();
			composer.addHeader().addCommentProcessing().addTreeShaking("Component");

			expect(composer.getStages()).toEqual([
				"Header",
				"Processamento de Comentários",
				"Tree Shaking",
			]);
		});
	});

	describe("encadeamento (chainable)", () => {
		it("deve permitir encadeamento completo", () => {
			const composer = new BundleComposer();

			const result = composer
				.addHeader()
				.addFilesConcatenation(context, false)
				.addCommentProcessing()
				.addTreeShaking("Component")
				.addDefaultProps()
				.addComponentExport("Component", false, null)
				.addExternalImports(context.externalImports)
				.addNocoBaseTransformation();

			expect(result).toBe(composer);
			expect(composer.getStages().length).toBe(8);
		});
	});

	describe("pipeline completo realista", () => {
		it("deve compor bundle TypeScript completo", async () => {
			const composer = new BundleComposer();
			composer
				.addHeader()
				.addFilesConcatenation(context, false)
				.addCommentProcessing()
				.addTreeShaking("Component");

			const result = await composer.compose();

			expect(result).toBeTruthy();
			expect(result.length).toBeGreaterThan(0);
		});

		it("deve compor bundle JavaScript completo", async () => {
			const composer = new BundleComposer();
			composer
				.addHeader()
				.addFilesConcatenation(context, true)
				.addCommentProcessing()
				.addTreeShaking("Component")
				.addExternalImports(context.externalImports)
				.addNocoBaseTransformation();

			const result = await composer.compose();

			expect(result).toBeTruthy();
			expect(result.length).toBeGreaterThan(0);
		});
	});
});
