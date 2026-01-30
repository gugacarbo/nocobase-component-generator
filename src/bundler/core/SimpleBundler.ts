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
import { CommentProcessor } from "../processors/CommentProcessor";
import { ExportProcessor } from "../processors/ExportProcessor";
import { BundleComposer } from "./BundleComposer";

export interface BundlerFactory {
	withOptions(options: Partial<BundlerConfig>): BundlerFactory;
	bundle(): Promise<BundleResult>;
	getContext(): BundlePipelineContext | null;
}

interface BundlerState {
	files: Map<string, FileInfo>;
	firstFileRelativePath: string;
	context: BundlePipelineContext | null;
}

export function createBundler(
	srcPath: string,
	outputDir: string,
): BundlerFactory {
	validatePaths(srcPath, outputDir);

	const isFile = FileLoader.fileExists(srcPath);
	let options: BundlerConfig = { ...APP_CONFIG.bundler };
	const state: BundlerState = {
		files: new Map(),
		firstFileRelativePath: "",
		context: null,
	};

	const factory: BundlerFactory = {
		withOptions(newOptions: Partial<BundlerConfig>) {
			options = { ...options, ...newOptions };
			return factory;
		},

		async bundle(): Promise<BundleResult> {
			try {
				Logger.start("Iniciando processo de bundling");

				await loadFiles(srcPath, isFile, state);

				if (state.files.size === 0) {
					throw new Error("Nenhum arquivo suportado encontrado para processar");
				}

				Logger.success.verbose(`${state.files.size} arquivos carregados`);

				state.context = createPipelineContext(state.files);
				Logger.info.verbose(
					`Componente principal: ${state.context.mainComponent || "não detectado"}`,
				);

				const fileName = ContentProcessor.getOutputFileName(
					state.context.mainComponent,
				);

				Logger.section("Gerando bundles");
				const result = await generateBundles(
					fileName,
					state.context,
					outputDir,
					state.firstFileRelativePath,
					options,
				);

				Logger.success("Bundling concluído com sucesso!");
				return result;
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				Logger.error("Erro durante bundling", err);
				throw err;
			}
		},

		getContext(): BundlePipelineContext | null {
			return state.context;
		},
	};

	return factory;
}

function validatePaths(srcPath: string, outputDir: string): void {
	if (!srcPath || srcPath.trim() === "") {
		throw new Error("srcPath não pode ser vazio");
	}

	if (!outputDir || outputDir.trim() === "") {
		throw new Error("outputDir não pode ser vazio");
	}

	const srcExists =
		FileLoader.fileExists(srcPath) || FileLoader.directoryExists(srcPath);
	if (!srcExists) {
		throw new Error(`Path não encontrado: ${srcPath}`);
	}
}

async function loadFiles(
	srcPath: string,
	isFile: boolean,
	state: BundlerState,
): Promise<void> {
	Logger.info.verbose("Carregando arquivos...");

	const result = isFile
		? FileLoader.loadSingleFile(srcPath)
		: FileLoader.loadDirectory(srcPath);

	state.files = result.files;
	state.firstFileRelativePath = result.firstFileRelativePath;
}

function createPipelineContext(
	files: Map<string, FileInfo>,
): BundlePipelineContext {
	Logger.info.verbose("Criando contexto de pipeline");

	const sortedFiles = DependencyResolver.sortFilesByDependency(files);

	// Extrai conteúdo dos arquivos ordenados
	const fileContents = new Map<string, string>();
	sortedFiles.forEach(filePath => {
		const fileInfo = files.get(filePath);
		if (fileInfo) {
			fileContents.set(filePath, fileInfo.content);
		}
	});

	const mainComponent = ComponentAnalyzer.findMainComponent(fileContents);
	const externalImports = ImportAnalyzer.analyzeExternalImports(fileContents);

	return {
		sortedFiles,
		fileContents,
		files,
		mainComponent,
		externalImports,
	};
}

function generateBundle(
	bundleOptions: BundleOptions,
	context: BundlePipelineContext,
): BundleResult {
	Logger.info.verbose(
		`Gerando bundle ${bundleOptions.isJavascript ? "JavaScript" : "TypeScript"}`,
	);

	// Usa o BundleComposer para construir o pipeline de forma modular
	const composer = new BundleComposer();

	composer
		.addHeader()
		.addFilesConcatenation(context, bundleOptions.isJavascript)
		.addCommentProcessing()
		.addTreeShaking(context.mainComponent)
		.addDefaultProps();

	if (context.mainComponent) {
		const { defaultProps } = ExportProcessor.extractDefaultProps("");
		composer.addComponentExport(
			context.mainComponent,
			bundleOptions.isJavascript,
			defaultProps,
		);
	}

	composer.addExternalImports(context.externalImports);

	if (bundleOptions.isJavascript) {
		composer.addNocoBaseTransformation();
	}

	Logger.info.verbose(`Pipeline: ${composer.getStages().join(" → ")}`);

	// Nota: A versão síncrona não pode ser usada com compose() async
	// Mantemos uma versão simplificada para compatibilidade
	let content = "";

	content += NocoBaseAdapter.generateBundleHeader();

	let codeContent = ContentProcessor.concatenateFiles(
		context.sortedFiles,
		context.files,
		bundleOptions.isJavascript,
	);

	codeContent = CommentProcessor.processComments(codeContent);
	codeContent = TreeShaker.shake(codeContent, context.mainComponent);

	const { defaultProps, contentWithout } =
		ExportProcessor.extractDefaultProps(codeContent);

	if (defaultProps) {
		content += defaultProps + "\n\n";
	}

	if (context.mainComponent) {
		if (bundleOptions.isJavascript) {
			content += NocoBaseAdapter.generateRender(
				context.mainComponent,
				defaultProps,
			);
		} else {
			content += NocoBaseAdapter.generateExport(context.mainComponent);
		}
	}

	const importStatements = ImportAnalyzer.generateImportStatements(
		context.externalImports,
	);

	content += importStatements;
	content += contentWithout;

	if (bundleOptions.isJavascript) {
		content = NocoBaseAdapter.transformImports(content);
	}

	if (!content || content.trim() === "") {
		throw new Error("Bundle gerado está vazio");
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

async function generateBundles(
	fileName: string,
	context: BundlePipelineContext,
	outputDir: string,
	firstFileRelativePath: string,
	options: BundlerConfig,
): Promise<BundleResult> {
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
			enabled: options.exportTypescript,
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

	for (const bundle of bundles) {
		if (!bundle.enabled) continue;

		Logger.info(`Gerando bundle ${bundle.type}...`);
		const result = generateBundle(bundle.options, context);

		await FileWriter.saveBundle(
			result,
			bundle.options.outputFileName,
			outputDir,
			firstFileRelativePath,
		);

		results.push(result);
		Logger.success(`Bundle ${bundle.type} gerado com sucesso`);
	}

	const [tsResult, jsResult] =
		results.length === 2 ? results : [undefined, results[0]];
	BundleReporter.printReport(
		tsResult,
		jsResult,
		context.sortedFiles,
		context.files,
	);

	return jsResult!;
}
