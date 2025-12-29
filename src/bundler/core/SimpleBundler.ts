import { APP_CONFIG } from "@/config/config";
import { Logger } from "@common/Logger";
import { BundlerConfig } from "@/config/types";
import {
	type FileInfo,
	type BundleOptions,
	type BundleResult,
	type BundlePipelineContext,
} from "./types";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { FileLoader } from "../processors/FileLoader";
import { TreeShaker } from "../processors/TreeShaker";
import { ComponentAnalyzer } from "../analyzers/ComponentAnalyzer";
import { BundleReporter } from "../reporters/BundleReporter";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";
import { NocoBaseAdapter } from "../adapters/NocoBaseAdapter";
import { ContentProcessor } from "../processors/ContentProcessor";
import { FileWriter } from "../processors/FileWriter";
import { ASTCache } from "../utils/ASTCache";

/**
 * Bundler simplificado otimizado para componentes React/NocoBase
 *
 * Implementa pipeline de bundling com:
 * - Carregamento paralelo de arquivos
 * - Análise de dependências
 * - Tree-shaking
 * - Transformações NocoBase
 * - Geração de bundles TypeScript e JavaScript
 */
export class SimpleBundler {
	private readonly srcPath: string;
	private readonly outputDir: string;
	private readonly isFile: boolean;

	/** Mapa de arquivos carregados (path → FileInfo) */
	private files: Map<string, FileInfo> = new Map();
	private firstFileRelativePath: string = "";
	private readonly options: BundlerConfig;

	constructor(
		srcPath: string,
		outputDir: string,
		options?: Partial<BundlerConfig>,
	) {
		this.srcPath = srcPath;
		this.outputDir = outputDir;
		this.isFile = FileLoader.fileExists(srcPath);
		this.options = { ...APP_CONFIG.bundler, ...options };
	}

	/**
	 * Executa o processo completo de bundling
	 * Pipeline: Carregamento → Análise → Ordenação → Geração
	 */
	public async bundle(): Promise<void> {
		Logger.start("Iniciando processo de bundling");

		// Carregamento paralelo de arquivos
		await this.loadFilesAsync();
		Logger.success.verbose(`${this.files.size} arquivos carregados`);

		// Criar contexto de pipeline compartilhado
		const pipelineContext = this.createPipelineContext();
		Logger.info.verbose(
			`Componente principal: ${pipelineContext.mainComponent || "não detectado"}`,
		);

		const fileName = ContentProcessor.getOutputFileName(
			pipelineContext.mainComponent,
		);

		Logger.section("Gerando bundles");
		await this.generateBundles(fileName, pipelineContext);

		// Limpa cache de AST para liberar memória
		ASTCache.clear();

		Logger.success("Bundling concluído com sucesso!");
	}

	/**
	 * Cria contexto de pipeline compartilhado
	 * Evita análise redundante entre geração de bundles TS e JS
	 */
	private createPipelineContext(): BundlePipelineContext {
		Logger.info.verbose("Criando contexto de pipeline");

		const sortedFiles = DependencyResolver.sortFilesByDependency(this.files);
		const fileContents = ContentProcessor.getFileContents(
			this.files,
			sortedFiles,
		);
		const mainComponent = ComponentAnalyzer.findMainComponent(fileContents);
		const externalImports = ImportAnalyzer.analyzeExternalImports(fileContents);

		return {
			sortedFiles,
			fileContents,
			files: this.files,
			mainComponent,
			externalImports,
		};
	}

	/**
	 * Pipeline de geração de bundle
	 * Cabeçalho → Imports → Concatenação → Comentários → Tree Shaking → Transformações → Export
	 */
	private async generateBundle(
		options: BundleOptions,
		context: BundlePipelineContext,
	): Promise<BundleResult> {
		Logger.info.verbose(
			`Gerando bundle ${options.isJavascript ? "JavaScript" : "TypeScript"}`,
		);
		let content = "";

		//* 1. Cabeçalho
		content += NocoBaseAdapter.generateBundleHeader();

		//* 2. Concatena arquivos e extrai defaultProps
		let codeContent = ContentProcessor.concatenateFiles(
			context.sortedFiles,
			context.files,
			options.isJavascript,
		);

		//* 3. Processa comentários especiais (//bundle-only, //no-bundle)
		codeContent = NocoBaseAdapter.processComments(codeContent);

		//* 4. Tree shaking (remove código não utilizado)
		codeContent = TreeShaker.shake(codeContent);

		//* 5. Extrai defaultProps do código
		const { defaultProps, contentWithout } =
			ContentProcessor.extractDefaultProps(codeContent);

		//* 6. defaultProps (se existir)
		if (defaultProps) {
			content += defaultProps + "\n\n";
		}

		//* 7. Export do componente principal
		if (context.mainComponent) {
			content += ContentProcessor.generateExport(
				context.mainComponent,
				options.isJavascript,
				defaultProps,
			);
		}

		//* 8. Imports externos (usa análise pré-computada do contexto)
		const importStatements = ImportAnalyzer.generateImportStatements(
			context.externalImports,
		);

		content += importStatements;

		//* 9. Adiciona código sem defaultProps
		content += contentWithout;

		//* 10. Transformações NocoBase (apenas para JavaScript)
		if (options.isJavascript) {
			content = NocoBaseAdapter.transformImports(content);
		}

		Logger.success.verbose(
			`Bundle gerado: ${(content.length / 1024).toFixed(2)} KB`,
		);

		return {
			content,
			fileCount: context.sortedFiles.length,
			sizeKB: content.length / 1024,
			files: context.sortedFiles,
			mainComponent: context.mainComponent || undefined,
		};
	}

	/**
	 * Carrega arquivos de forma assíncrona
	 * Preparado para processamento paralelo futuro
	 */
	private async loadFilesAsync(): Promise<void> {
		Logger.info.verbose("Carregando arquivos...");

		const result = await Promise.resolve(
			this.isFile
				? FileLoader.loadSingleFile(this.srcPath)
				: FileLoader.loadDirectory(this.srcPath),
		);

		this.files = result.files;
		this.firstFileRelativePath = result.firstFileRelativePath;
	}

	/**
	 * Gera bundles TypeScript (opcional) e JavaScript
	 * Utiliza contexto compartilhado para evitar reprocessamento
	 */
	private async generateBundles(
		fileName: string,
		context: BundlePipelineContext,
	): Promise<void> {
		const bundles: Array<{
			options: BundleOptions;
			enabled: boolean;
			type: "TypeScript" | "JavaScript";
		}> = [
			{
				options: {
					isJavascript: false,
					outputFileName: `${fileName}.tsx`,
				},
				enabled: this.options.exportTypescript,
				type: "TypeScript",
			},
			{
				options: {
					isJavascript: true,
					outputFileName: `${fileName}${APP_CONFIG.bundler.OUTPUT_EXTENSION}`,
				},
				enabled: true,
				type: "JavaScript",
			},
		];

		const results: BundleResult[] = [];

		// Gera bundles em sequência (contexto já está otimizado)
		for (const bundle of bundles) {
			if (!bundle.enabled) continue;

			Logger.info(`Gerando bundle ${bundle.type}...`);
			const result = await this.generateBundle(bundle.options, context);

			await FileWriter.saveBundle(
				result,
				bundle.options.outputFileName,
				this.outputDir,
				this.firstFileRelativePath,
			);

			results.push(result);
			Logger.success(`Bundle ${bundle.type} gerado com sucesso`);
		}

		// Relatório final
		const [tsResult, jsResult] =
			results.length === 2 ? results : [undefined, results[0]];
		BundleReporter.printReport(
			tsResult,
			jsResult,
			context.sortedFiles,
			context.files,
		);
	}
}
