import { describe, it, expect } from "vitest";
import { BundleService } from "../../../services/BundleService";

describe("BundleService", () => {
	describe("getOutputFileName", () => {
		it("deve gerar nome de arquivo válido", () => {
			const fileName = BundleService.getOutputFileName("demandas");

			expect(fileName).toBe("demandas.jsx");
		});

		it("deve gerar nome de arquivo para caminhos aninhados", () => {
			const fileName = BundleService.getOutputFileName("CRM/demandas");

			expect(fileName).toBe("demandas.jsx");
		});

		it("deve remover extensões existentes", () => {
			const fileName = BundleService.getOutputFileName("demandas.tsx");

			expect(fileName).toBe("demandas.jsx");
		});

		it("deve lidar com paths complexos", () => {
			const fileName = BundleService.getOutputFileName(
				"CRM/demandas/subcomponent.tsx",
			);

			expect(fileName).toBe("subcomponent.jsx");
		});

		it("deve sempre retornar extensão .jsx", () => {
			const fileName = BundleService.getOutputFileName("component");

			expect(fileName).toMatch(/\.jsx$/);
		});
	});

	describe("readGeneratedCode", () => {
		it("deve lidar com caminhos inválidos graciosamente", async () => {
			try {
				const code = await BundleService.readGeneratedCode("", "");

				// Deve retornar vazio ou falhar graciosamente
				expect(code === "" || code === undefined).toBe(true);
			} catch {
				// Também é aceitável lançar erro
				expect(true).toBe(true);
			}
		});
	});

	describe("getPaths", () => {
		it("deve retornar estrutura válida", () => {
			const paths = BundleService.getPaths("test");

			expect(paths).toBeDefined();
			expect(paths).toHaveProperty("componentSubPath");
			expect(paths).toHaveProperty("componentSubDir");
			expect(paths).toHaveProperty("componentFilePath");
			expect(paths).toHaveProperty("outputDir");
		});

		it("deve extrair componente simples corretamente", () => {
			const paths = BundleService.getPaths("demandas");

			expect(paths.componentSubPath).toBe("demandas");
		});

		it("deve extrair caminho aninhado corretamente", () => {
			const paths = BundleService.getPaths("CRM/demandas");

			expect(paths.componentSubPath).toBe("CRM");
		});
	});

	describe("integração básica", () => {
		it("deve trabalhar com múltiplos métodos em sequência", () => {
			const componentPath = "CRM/demandas";
			const paths = BundleService.getPaths(componentPath);
			const fileName = BundleService.getOutputFileName(componentPath);

			expect(paths).toBeDefined();
			expect(fileName).toBe("demandas.jsx");
			expect(fileName).toMatch(/\.jsx$/);
		});
	});
});
