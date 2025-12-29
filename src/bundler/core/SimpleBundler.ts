import { APP_CONFIG } from "@/config/config";
import { Logger } from "@common/Logger";
import {
	type FileInfo,
	type BundleOptions,
	type BundleResult,
	DependencyResolver,
	FileProcessor,
	TreeShaker,
	ComponentAnalyzer,
	BundleReporter,
	CodeAnalyzer,
	NocoBaseAdapter,
} from "@bundler/.";
import { BundlerConfig } from "@/config/types";

export class SimpleBundler {
	private readonly srcPath: string;
	private readonly outputDir: string;
	private readonly isFile: boolean;

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
		this.isFile = FileProcessor.fileExists(srcPath);
		this.options = { ...APP_CONFIG.bundler, ...options };
	}

	// [ Executa o processo completo de bundling ]
	public async bundle(): Promise<void> {
		Logger.start("Iniciando processo de bundling");
		this.loadFiles();

		const sortedFiles = DependencyResolver.sortFilesByDependency(this.files);
		Logger.success.verbose(`${this.files.size} arquivos carregados`);

		const sortedFileContents = FileProcessor.getFileContents(
			this.files,
			sortedFiles,
		);
		const mainComponent =
			ComponentAnalyzer.findMainComponent(sortedFileContents);
		const fileName = FileProcessor.getOutputFileName(mainComponent);

		Logger.section("Gerando bundles");
		await this.generateBundles(sortedFiles, fileName, sortedFileContents);

		Logger.success("Bundling concluído com sucesso!");
	}

	// [ Pipeline: Cabeçalho → Imports → Concatenação → Comentários → Tree Shaking → Transformações → Export ]
	private async generateBundle(
		sortedFiles: string[],
		options: BundleOptions,
		fileContents: Map<string, string>,
	): Promise<BundleResult> {
		let content = "";

		//* 0. Adiciona export/render do componente principal
		const mainComponent = ComponentAnalyzer.findMainComponent(fileContents);

		//* 1. Cabeçalho
		content += NocoBaseAdapter.generateBundleHeader();

		if (mainComponent) {
			content += FileProcessor.generateExport(
				mainComponent,
				options.isJavascript,
			);
		}

		content += "\n\n";

		//* 2. Imports externos
		const externalImports = CodeAnalyzer.analyzeExternalImports(fileContents);
		const importStatements =
			CodeAnalyzer.generateImportStatements(externalImports);

		content += importStatements;

		//* 3. Concatena arquivos
		let codeContent = FileProcessor.concatenateFiles(
			sortedFiles,
			this.files,
			options.isJavascript,
		);

		//* 4. Processa comentários especiais
		codeContent = NocoBaseAdapter.processComments(codeContent);

		//* 5. Tree shaking (remove código não utilizado)
		codeContent = TreeShaker.shake(codeContent);
		content += codeContent;

		//* 6. Transformações NocoBase
		if (options.isJavascript) {
			content = NocoBaseAdapter.transformImports(content);
		}

		return {
			content,
			fileCount: sortedFiles.length,
			sizeKB: content.length / 1024,
			files: sortedFiles,
			mainComponent: mainComponent || undefined,
		};
	}

	// [ Carrega todos os arquivos necessários (arquivo único ou diretório) ]
	private loadFiles(): void {
		const result = this.isFile
			? FileProcessor.loadSingleFile(this.srcPath)
			: FileProcessor.loadDirectory(this.srcPath);

		this.files = result.files;
		this.firstFileRelativePath = result.firstFileRelativePath;
	}

	// [ Gera os bundles TypeScript (opcional) e JavaScript ]
	private async generateBundles(
		sortedFiles: string[],
		fileName: string,
		fileContents: Map<string, string>,
	): Promise<void> {
		let tsResult: BundleResult | undefined;

		//? Gera bundle TypeScript se habilitado
		if (this.options.exportTypescript) {
			const tsOptions: BundleOptions = {
				isJavascript: false,
				outputFileName: `${fileName}.tsx`,
			};
			tsResult = await this.generateBundle(
				sortedFiles,
				tsOptions,
				fileContents,
			);
			await FileProcessor.saveBundle(
				tsResult,
				tsOptions.outputFileName,
				this.outputDir,
				this.firstFileRelativePath,
			);
		}

		//* Gera bundle JavaScript (sempre)
		const jsOptions: BundleOptions = {
			isJavascript: true,
			outputFileName: `${fileName}${APP_CONFIG.bundler.OUTPUT_EXTENSION}`,
		};
		const jsResult = await this.generateBundle(
			sortedFiles,
			jsOptions,
			fileContents,
		);
		await FileProcessor.saveBundle(
			jsResult,
			jsOptions.outputFileName,
			this.outputDir,
			this.firstFileRelativePath,
		);

		BundleReporter.printReport(tsResult, jsResult, sortedFiles, this.files);
	}
}
