import { SimpleBundler } from "../bundler/SimpleBundler";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface BundleRequest {
	componentPath: string;
}

export interface BundleResponse {
	success: boolean;
	message?: string;
	error?: string;
}

export async function handleBundleRequest(
	req: BundleRequest,
): Promise<BundleResponse> {
	try {
		const { componentPath } = req;

		if (!componentPath) {
			return {
				success: false,
				error: "componentPath é obrigatório",
			};
		}

		const normalizedComponentPath = componentPath.replace(/\\/g, "/");
		const componentsMarker = "components/";
		const componentSubPath = normalizedComponentPath.includes(componentsMarker)
			? normalizedComponentPath.substring(
					normalizedComponentPath.indexOf(componentsMarker) +
						componentsMarker.length,
				)
			: normalizedComponentPath;

		// Diretório relativo a partir de components (sem nome do arquivo)
		const componentSubDirTmp = path.posix.dirname(componentSubPath);
		const componentSubDir =
			componentSubDirTmp === "." ? "" : componentSubDirTmp;

		// Resolve o caminho completo do arquivo do componente
		const projectRoot = path.resolve(__dirname, "../../");
		const componentFilePath = path.resolve(projectRoot, componentPath);
		const outputDir = path.resolve(projectRoot, "output", componentSubDir);

		console.log(`\n🔨 Gerando bundle para: ${componentPath}`);
		console.log(`   Subpath: ${componentSubPath}`);
		console.log(`   Subdir: ${componentSubDir}`);
		console.log(`   Arquivo: ${componentFilePath}`);
		console.log(`   Destino: ${outputDir}`);

		// Executa o bundler passando o arquivo específico
		const bundler = new SimpleBundler(componentFilePath, outputDir);
		await bundler.bundle();

		return {
			success: true,
			message: `Bundle gerado com sucesso para ${componentPath}`,
		};
	} catch (error) {
		console.error("Erro ao gerar bundle:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Erro desconhecido",
		};
	}
}
