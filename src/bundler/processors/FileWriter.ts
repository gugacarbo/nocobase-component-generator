import * as fs from "fs";
import { PathUtils } from "@/common/utils/PathUtils";
import { Logger } from "@/common/Logger";
import { BundleResult } from "../core/types";
import { CodeFormatter } from "./CodeFormatter";

/**
 * Responsável por escrever bundles no disco
 */
export class FileWriter {
	/**
	 * Cria um diretório recursivamente
	 */
	public static ensureDirectory(dirPath: string): void {
		if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
			fs.mkdirSync(dirPath, { recursive: true });
		}
	}

	/**
	 * Escreve um arquivo com tratamento de erros
	 */
	public static writeFile(filePath: string, content: string): boolean {
		try {
			this.ensureDirectory(PathUtils.dirname(filePath));
			fs.writeFileSync(filePath, content, "utf-8");
			return true;
		} catch (error) {
			Logger.error(`Erro ao escrever arquivo ${filePath}`, error as Error);
			return false;
		}
	}

	/**
	 * Salva o bundle formatado no disco
	 */
	public static async saveBundle(
		result: BundleResult,
		fileName: string,
		outputDir: string,
		firstFileRelativePath: string,
	): Promise<void> {
		const outputPath = this.getOutputPath(
			outputDir,
			firstFileRelativePath,
			fileName,
		);

		const isTypeScript = fileName.endsWith(".tsx");
		const formattedContent = await CodeFormatter.format(
			result.content,
			isTypeScript,
		);

		this.ensureDirectory(PathUtils.dirname(outputPath));
		this.writeFile(outputPath, formattedContent);

		Logger.file(`${fileName} salvo: ${outputPath}`);
	}

	/**
	 * Calcula o caminho de saída completo
	 */
	private static getOutputPath(
		outputDir: string,
		firstFileRelativePath: string,
		fileName: string,
	): string {
		const firstFileDir = PathUtils.dirname(firstFileRelativePath);
		const outputSubDir = PathUtils.join(outputDir, firstFileDir);
		return PathUtils.join(outputSubDir, fileName);
	}
}
