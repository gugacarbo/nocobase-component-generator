import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import { SimpleBundler } from "../bundler/core/SimpleBundler";
import { StringUtils } from "../common/utils/StringUtils";
import { Logger } from "@/common/Logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BundleRequest {
	componentPath: string;
}

export interface BundleResponse {
	success: boolean;
	message?: string;
	error?: string;
	code?: string;
}

export async function handleBundleRequest(
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

		const { componentSubPath, componentSubDir, componentFilePath, outputDir } =
			getPaths(componentPath);

		Logger.start.verbose(`Gerando bundle para: ${componentPath}`);
		Logger.info.verbose(`Subpath: ${componentSubPath}`);
		Logger.info.verbose(`Subdir: ${componentSubDir}`);
		Logger.info.verbose(`Arquivo: ${componentFilePath}`);
		Logger.info.verbose(`Destino: ${outputDir}`);

		const bundler = new SimpleBundler(componentFilePath, outputDir);

		await bundler.bundle();

		const baseFileName = path.basename(
			componentFilePath,
			path.extname(componentFilePath),
		);
		
		const outputFileName = StringUtils.toKebabCase(baseFileName) + ".jsx";
		const outputFilePath = path.join(outputDir, outputFileName);

		let code: string | undefined;
		try {
			code = await fs.readFile(outputFilePath, "utf-8");
		} catch (readError) {
			Logger.warning(
				`Aviso: Não foi possível ler o arquivo gerado em ${outputFilePath}`,
			);
		}

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

function getPaths(componentPath: string) {
	const normalizedComponentPath = componentPath.replace(/\\/g, "/");
	const componentsMarker = "components/";
	const componentSubPath = normalizedComponentPath.includes(componentsMarker)
		? normalizedComponentPath.substring(
				normalizedComponentPath.indexOf(componentsMarker) +
					componentsMarker.length,
			)
		: normalizedComponentPath;

	const componentSubDirTmp = path.posix.dirname(componentSubPath);
	const componentSubDir = componentSubDirTmp === "." ? "" : componentSubDirTmp;

	const projectRoot = path.resolve(__dirname, "../../");
	const componentFilePath = path.resolve(projectRoot, componentPath);
	const outputDir = path.resolve(projectRoot, "output", componentSubDir);

	return {
		componentSubPath,
		componentSubDir,
		componentFilePath,
		outputDir,
	};
}
