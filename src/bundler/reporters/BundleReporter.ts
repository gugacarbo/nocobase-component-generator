import type { BundleResult } from "../core/types";
import { Logger } from "../../common/Logger";

/**
 * Gerador de relatórios de bundling
 */
export class BundleReporter {
	/**
	 * Imprime relatório detalhado do bundling (modo verbose)
	 */
	public static printReport(
		tsResult: BundleResult | undefined,
		jsResult: BundleResult,
		sortedFiles: string[],
		fileInfoMap: Map<string, { relativePath: string }>,
	): void {
		if (!Logger.isVerbose()) {
			return;
		}

		this.printHeader();
		this.printStatistics(tsResult, jsResult, sortedFiles);
		this.printFileList(sortedFiles, fileInfoMap);
	}

	/**
	 * Imprime cabeçalho do relatório
	 */
	private static printHeader(): void {
		Logger.separator();
		Logger.section("📊 Relatório de Bundling");
	}

	/**
	 * Imprime estatísticas do bundling
	 */
	private static printStatistics(
		tsResult: BundleResult | undefined,
		jsResult: BundleResult,
		sortedFiles: string[],
	): void {
		Logger.stats("Arquivos processados", sortedFiles.length);

		const mainComponent =
			tsResult?.mainComponent || jsResult.mainComponent || "Não detectado";
		Logger.stats("Componente principal", mainComponent);

		if (tsResult) {
			Logger.stats("Tamanho TypeScript", `${tsResult.sizeKB.toFixed(2)} KB`);
		}
		Logger.stats("Tamanho JavaScript", `${jsResult.sizeKB.toFixed(2)} KB`);
	}

	/**
	 * Imprime lista de arquivos processados
	 */
	private static printFileList(
		sortedFiles: string[],
		fileInfoMap: Map<string, { relativePath: string }>,
	): void {
		Logger.separator();
		Logger.info("Arquivos em ordem de dependência:");

		sortedFiles.forEach((filePath, index) => {
			const fileInfo = fileInfoMap.get(filePath);
			if (fileInfo) {
				console.log(`   ${index + 1}. ${fileInfo.relativePath}`);
			}
		});
	}
}
