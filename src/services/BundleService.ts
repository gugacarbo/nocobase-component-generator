import * as path from "path";
import { createBundler } from "../bundler/core/SimpleBundler";
import { StringUtils } from "../common/utils/StringUtils";
import { Logger } from "@/common/Logger";
import { APP_CONFIG } from "@/config/config";

/**
 * Request para bundling de componente
 */
export interface BundleRequest {
	componentPath: string;
}

/**
 * Response do bundling
 */
export interface BundleResponse {
	success: boolean;
	message?: string;
	error?: string;
	code?: string;
}

/**
 * Informações sobre paths do componente
 */
export interface ComponentPaths {
	componentSubPath: string;
	componentSubDir: string;
	componentFilePath: string;
	outputDir: string;
}

/**
 * Serviço centralizado para bundling de componentes
 * Consolida lógica compartilhada entre bundle.ts e bundle-api.ts
 */
export class BundleService {
	/**
	 * Processa uma requisição de bundling
	 */
	static async handleBundleRequest(
		req: BundleRequest,
	): Promise<BundleResponse> {
		try {
			const { componentPath } = req;

			if (!componentPath) {
				Logger.error("Erro: componentPath é obrigatório");
				return {
					success: false,
					error: "componentPath é obrigatório",
				};
			}

			const paths = this.getPaths(componentPath);

			Logger.start.verbose(`Gerando bundle para: ${componentPath}`);
			Logger.info.verbose(`Arquivo: ${paths.componentFilePath}`);
			Logger.info.verbose(`Destino: ${paths.outputDir}`);

			// Executa o bundling
			const bundler = createBundler(paths.componentFilePath, paths.outputDir);
			await bundler.bundle();

			// Lê o arquivo gerado
			const outputFileName = this.getOutputFileName(paths.componentFilePath);
			const code = await this.readGeneratedCode(
				paths.outputDir,
				outputFileName,
			);

			return {
				success: true,
				message: `Bundle gerado com sucesso para ${componentPath}`,
				code,
			};
		} catch (error) {
			Logger.error("Erro ao gerar bundle:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Erro desconhecido",
			};
		}
	}

	/**
	 * Extrai os paths necessários a partir do componentPath
	 */
	static getPaths(componentPath: string): ComponentPaths {
		const componentsDir = path.resolve("components");
		const fullPath = path.resolve(componentsDir, componentPath);
		const relativePath = path.relative(componentsDir, fullPath);

		// Extrai domínio (ex: CRM, Atacado) e subdiretório
		const pathParts = relativePath.split(path.sep);
		const componentSubPath = pathParts[0]; // CRM, Atacado, etc
		const componentSubDir =
			pathParts.length > 1
				? pathParts.slice(0, -1).join("/")
				: componentSubPath;

		const outputDir = path.resolve("output", componentSubDir);

		return {
			componentSubPath,
			componentSubDir,
			componentFilePath: fullPath,
			outputDir,
		};
	}

	/**
	 * Gera o nome do arquivo de saída
	 */
	static getOutputFileName(componentFilePath: string): string {
		const baseFileName = path.basename(
			componentFilePath,
			path.extname(componentFilePath),
		);

		return (
			StringUtils.toKebabCase(baseFileName) +
			APP_CONFIG.bundler.OUTPUT_EXTENSION
		);
	}

	/**
	 * Lê o código do arquivo gerado
	 */
	static async readGeneratedCode(
		outputDir: string,
		outputFileName: string,
	): Promise<string | undefined> {
		try {
			const { promises: fs } = await import("fs");
			const outputFilePath = path.join(outputDir, outputFileName);
			return await fs.readFile(outputFilePath, "utf-8");
		} catch (error) {
			Logger.warning(
				`Aviso: Não foi possível ler o arquivo gerado: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
			);
			return undefined;
		}
	}
}
