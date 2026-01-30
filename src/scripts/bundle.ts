import { Logger } from "@/common/Logger";
import { BundleService } from "../services/BundleService";

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

	const result = await BundleService.handleBundleRequest({ componentPath });

	if (result.success) {
		Logger.success(result.message || "Bundle gerado com sucesso!");
		process.exit(0);
	} else {
		Logger.error(result.error || "Erro desconhecido ao gerar bundle");
		process.exit(1);
	}
}

main();
