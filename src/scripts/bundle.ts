import * as path from "path";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import { SimpleBundler } from "../bundler/core/SimpleBundler";
import { StringUtils } from "../common/utils/StringUtils";
import { Logger } from "@/common/Logger";
import { APP_CONFIG } from "@/config/config";

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

		const outputFileName =
			StringUtils.toKebabCase(baseFileName) +
			APP_CONFIG.bundler.OUTPUT_EXTENSION;
		const outputFilePath = path.join(outputDir, outputFileName);

		let code: string | undefined;
		try {
			code = await fs.readFile(outputFilePath, "utf-8");
		} catch (readError) {
			Logger.error(
				`Aviso: Não foi possível ler o arquivo gerado em ${outputFilePath}`,
				readError,
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
	const componentsMarker = `${APP_CONFIG.componentsPath}/`;

	const normalizedComponentPath = componentPath.replace(/\\/g, "/");
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

function printUsage() {
	console.log(`
Uso: pnpm bundle <componentPath>

Argumentos:
  componentPath    Caminho do componente a ser bundled (relativo à pasta components/)

Exemplos:
  pnpm bundle components/CRM/demandas/sla-date-bar/sla-date-bar.tsx
  pnpm bundle components/test/button-example.tsx

Opções:
  --verbose, -v    Exibe logs detalhados
  --help, -h       Exibe esta mensagem de ajuda
`);
}

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		printUsage();
		process.exit(0);
	}

	if (args.includes("--verbose") || args.includes("-v")) {
		Logger.setVerbose(true);
	}

	const componentPath = args.find(arg => !arg.startsWith("-"));

	if (!componentPath) {
		Logger.error("Erro: componentPath é obrigatório");
		printUsage();
		process.exit(1);
	}

	Logger.start(`Iniciando bundle para: ${componentPath}`);

	const result = await handleBundleRequest({ componentPath });

	if (result.success) {
		Logger.success(result.message || "Bundle gerado com sucesso!");
		process.exit(0);
	} else {
		Logger.error(result.error || "Erro desconhecido ao gerar bundle");
		process.exit(1);
	}
}

main();
