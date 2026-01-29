import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BundleReporter } from "../../reporters/BundleReporter";
import type { BundleResult } from "../../core/types";

vi.mock("../../../common/Logger", () => ({
	Logger: {
		isVerbose: vi.fn().mockReturnValue(false),
		separator: vi.fn(),
		section: vi.fn(),
		stats: vi.fn(),
		info: Object.assign(vi.fn(), { verbose: vi.fn() }),
	},
}));

describe("BundleReporter", () => {
	let mockLogger: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import("../../../common/Logger");
		mockLogger = mod.Logger;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("printReport", () => {
		const createMockResult = (
			overrides: Partial<BundleResult> = {},
		): BundleResult => ({
			content: "const Component = () => <div />;",
			files: ["component.jsx"],
			mainComponent: "Component",
			sizeKB: 1.5,
			fileCount: 1,
			...overrides,
		});

		it("não deve imprimir nada se verbose estiver desativado", () => {
			mockLogger.isVerbose.mockReturnValue(false);

			BundleReporter.printReport(
				undefined,
				createMockResult(),
				["/test/component.tsx"],
				new Map([["/test/component.tsx", { relativePath: "component.tsx" }]]),
			);

			expect(mockLogger.separator).not.toHaveBeenCalled();
			expect(mockLogger.section).not.toHaveBeenCalled();
		});

		it("deve imprimir relatório completo em modo verbose", () => {
			mockLogger.isVerbose.mockReturnValue(true);

			const jsResult = createMockResult();
			const sortedFiles = ["/test/component.tsx"];
			const fileInfoMap = new Map([
				["/test/component.tsx", { relativePath: "component.tsx" }],
			]);

			BundleReporter.printReport(undefined, jsResult, sortedFiles, fileInfoMap);

			expect(mockLogger.separator).toHaveBeenCalled();
			expect(mockLogger.section).toHaveBeenCalledWith(
				"📊 Relatório de Bundling",
			);
			expect(mockLogger.stats).toHaveBeenCalled();
		});

		it("deve mostrar estatísticas de TypeScript quando disponível", () => {
			mockLogger.isVerbose.mockReturnValue(true);

			const tsResult = createMockResult({ sizeKB: 2.5 });
			const jsResult = createMockResult({ sizeKB: 1.5 });

			BundleReporter.printReport(
				tsResult,
				jsResult,
				["/test/component.tsx"],
				new Map([["/test/component.tsx", { relativePath: "component.tsx" }]]),
			);

			expect(mockLogger.stats).toHaveBeenCalledWith(
				"Tamanho TypeScript",
				"2.50 KB",
			);
			expect(mockLogger.stats).toHaveBeenCalledWith(
				"Tamanho JavaScript",
				"1.50 KB",
			);
		});

		it("deve mostrar nome do componente principal", () => {
			mockLogger.isVerbose.mockReturnValue(true);

			const jsResult = createMockResult({ mainComponent: "MyComponent" });

			BundleReporter.printReport(
				undefined,
				jsResult,
				["/test/component.tsx"],
				new Map([["/test/component.tsx", { relativePath: "component.tsx" }]]),
			);

			expect(mockLogger.stats).toHaveBeenCalledWith(
				"Componente principal",
				"MyComponent",
			);
		});

		it("deve mostrar 'Não detectado' quando não há componente principal", () => {
			mockLogger.isVerbose.mockReturnValue(true);

			const jsResult = createMockResult({ mainComponent: undefined });

			BundleReporter.printReport(
				undefined,
				jsResult,
				["/test/component.tsx"],
				new Map([["/test/component.tsx", { relativePath: "component.tsx" }]]),
			);

			expect(mockLogger.stats).toHaveBeenCalledWith(
				"Componente principal",
				"Não detectado",
			);
		});

		it("deve mostrar contagem de arquivos processados", () => {
			mockLogger.isVerbose.mockReturnValue(true);

			const sortedFiles = ["/test/a.tsx", "/test/b.tsx", "/test/c.tsx"];

			BundleReporter.printReport(
				undefined,
				createMockResult(),
				sortedFiles,
				new Map([
					["/test/a.tsx", { relativePath: "a.tsx" }],
					["/test/b.tsx", { relativePath: "b.tsx" }],
					["/test/c.tsx", { relativePath: "c.tsx" }],
				]),
			);

			expect(mockLogger.stats).toHaveBeenCalledWith("Arquivos processados", 3);
		});
	});
});
