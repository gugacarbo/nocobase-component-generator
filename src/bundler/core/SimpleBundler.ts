import * as fs from "fs";
import { FileInfo, BundleOptions, BundleResult } from "../core/types";
import { FileProcessor } from "../processors/FileProcessor";
import { DependencyResolver } from "../resolvers/DependencyResolver";
import { CodeAnalyzer } from "../analyzers/CodeAnalyzer";
import { ComponentDetector } from "../analyzers/ComponentDetector";
import { TreeShaker } from "../processors/TreeShaker";
import { CodeFormatter } from "../processors/CodeFormatter";
import { NocoBaseTransformer } from "../transformers/NocoBaseTransformer";
import { Logger } from "../utils/Logger";
import { StringUtils } from "../utils/StringUtils";
import { PathUtils } from "../utils/PathUtils";

/**
 * Bundler principal que coordena todo o processo
 */
export class SimpleBundler {
	private srcPath: string;
	private outputDir: string;
	private files: Map<string, FileInfo> = new Map();
	private isFile: boolean;
	private firstFileRelativePath: string = "";

	// Dependências
	private dependencyResolver = new DependencyResolver();
	private codeAnalyzer = new CodeAnalyzer();
	private treeShaker = new TreeShaker();

	constructor(srcPath: string, outputDir: string) {
		this.srcPath = srcPath;
		this.outputDir = outputDir;
		this.isFile = fs.existsSync(srcPath) && fs.statSync(srcPath).isFile();
	}

	/**
	 * Executa o processo completo de bundling
	 */
	public async bundle(): Promise<void> {
		Logger.start("Iniciando processo de bundling");

		// Fase 1: Carregamento de arquivos
		this.loadFiles();
		Logger.success(`${this.files.size} arquivos carregados`);

		// Fase 2: Resolução de dependências
		const sortedFiles = this.dependencyResolver.sortFilesByDependency(
			this.files
		);
		Logger.info("Dependências resolvidas");

		// Fase 3: Detecção do componente principal
		const fileContents = this.getFileContents(sortedFiles);
		const mainComponent = ComponentDetector.findMainComponent(fileContents);
		const fileName = this.getOutputFileName(mainComponent);

		// Fase 4: Geração dos bundles
		await this.generateBundles(sortedFiles, fileName, fileContents);

		Logger.success("Bundling concluído com sucesso!");
	}

	/**
	 * Carrega todos os arquivos necessários
	 */
	private loadFiles(): void {
		if (this.isFile) {
			this.loadSingleFile();
		} else {
			this.loadDirectory();
		}
	}

	/**
	 * Carrega um arquivo único e suas dependências
	 */
	private loadSingleFile(): void {
		const baseDir = PathUtils.dirname(this.srcPath);
		this.loadFileWithDependencies(this.srcPath, baseDir);

		const fileInfo = this.files.get(this.srcPath);
		if (fileInfo) {
			this.firstFileRelativePath = fileInfo.relativePath;
		}
	}

	/**
	 * Carrega todos os arquivos de um diretório
	 */
	private loadDirectory(): void {
		const allFiles = FileProcessor.findFiles(this.srcPath);

		allFiles.forEach((filePath, index) => {
			const fileInfo = FileProcessor.loadFileInfo(filePath, this.srcPath);
			this.files.set(filePath, fileInfo);

			if (index === 0) {
				this.firstFileRelativePath = fileInfo.relativePath;
			}
		});
	}

	/**
	 * Carrega um arquivo e suas dependências recursivamente
	 */
	private loadFileWithDependencies(filePath: string, baseDir: string): void {
		if (this.files.has(filePath)) {
			return;
		}

		const fileInfo = FileProcessor.loadFileInfo(filePath, baseDir);
		this.files.set(filePath, fileInfo);

		fileInfo.imports.forEach((importPath) => {
			const resolvedPath = DependencyResolver.resolveImportPath(
				filePath,
				importPath
			);

			if (resolvedPath && fs.existsSync(resolvedPath)) {
				this.loadFileWithDependencies(resolvedPath, baseDir);
			}
		});
	}

	/**
	 * Obtém o conteúdo de todos os arquivos
	 */
	private getFileContents(sortedFiles: string[]): Map<string, string> {
		const contents = new Map<string, string>();
		sortedFiles.forEach((filePath) => {
			const fileInfo = this.files.get(filePath);
			if (fileInfo) {
				contents.set(filePath, fileInfo.content);
			}
		});
		return contents;
	}

	/**
	 * Determina o nome do arquivo de saída
	 */
	private getOutputFileName(mainComponent: string | null): string {
		return mainComponent
			? StringUtils.toKebabCase(mainComponent)
			: "bundled-component";
	}

	/**
	 * Gera os bundles TypeScript e JavaScript
	 */
	private async generateBundles(
		sortedFiles: string[],
		fileName: string,
		fileContents: Map<string, string>
	): Promise<void> {
		Logger.section("Gerando bundles");

		// Gera bundle TypeScript
		const tsOptions: BundleOptions = {
			removeTypes: false,
			outputFileName: `${fileName}.tsx`,
		};
		const tsResult = await this.generateBundle(
			sortedFiles,
			tsOptions,
			fileContents
		);
		await this.saveBundle(tsResult, tsOptions.outputFileName);

		// Gera bundle JavaScript
		const jsOptions: BundleOptions = {
			removeTypes: true,
			outputFileName: `${fileName}.jsx`,
		};
		const jsResult = await this.generateBundle(
			sortedFiles,
			jsOptions,
			fileContents
		);
		await this.saveBundle(jsResult, jsOptions.outputFileName);

		// Exibe relatório
		this.printReport(tsResult, jsResult, sortedFiles);
	}

	/**
	 * Gera um bundle (pipeline completo)
	 */
	private async generateBundle(
		sortedFiles: string[],
		options: BundleOptions,
		fileContents: Map<string, string>
	): Promise<BundleResult> {
		let content = "";

		// 1. Cabeçalho (opcional, apenas para TS)
		if (!options.removeTypes) {
			content += this.generateHeader();
		}

		// 2. Imports externos
		const externalImports = this.codeAnalyzer.analyzeImports(fileContents);
		const importStatements =
			this.codeAnalyzer.generateImportStatements(externalImports);
		content += importStatements;

		// 3. Concatena arquivos
		let codeContent = this.concatenateFiles(sortedFiles, options.removeTypes);

		// 4. Tree shaking
		codeContent = this.treeShaker.shake(codeContent);
		content += codeContent;

		// 5. Remove imports não utilizados
		const usedIdentifiers = this.codeAnalyzer.analyzeUsage(content);
		content = this.codeAnalyzer.removeUnusedImports(content, usedIdentifiers);

		// 6. Transformações NocoBase (se JavaScript)
		if (options.removeTypes) {
			content = NocoBaseTransformer.transformImports(content);
			content = NocoBaseTransformer.processComments(content);
		}

		// 7. Adiciona componente principal
		const mainComponent = ComponentDetector.findMainComponent(fileContents);
		if (mainComponent) {
			content += this.generateMainComponentRender(
				mainComponent,
				options.removeTypes
			);
		}

		return {
			content,
			fileCount: sortedFiles.length,
			sizeKB: content.length / 1024,
			files: sortedFiles,
			mainComponent: mainComponent || undefined,
		};
	}

	/**
	 * Gera o cabeçalho do bundle
	 */
	private generateHeader(): string {
		const now = new Date().toLocaleString("pt-BR");
		return `// Componente gerado pelo NocoBase Component Generator\n// Data: ${now}\n// Versão: Com TypeScript\n\n`;
	}

	/**
	 * Concatena todos os arquivos
	 */
	private concatenateFiles(
		sortedFiles: string[],
		removeTypes: boolean
	): string {
		let content = "";

		sortedFiles.forEach((filePath) => {
			const fileInfo = this.files.get(filePath);
			if (!fileInfo) return;

			// Ignora arquivos mock, test, spec
			if (fileInfo.relativePath.match(/\.(mock|test|spec)\.(tsx?|jsx?)$/)) {
				return;
			}

			const cleanedContent = FileProcessor.cleanContent(
				fileInfo.content,
				fileInfo.relativePath,
				removeTypes
			);

			if (!removeTypes) {
				content += `// ========================================\n`;
				content += `// Arquivo: ${fileInfo.relativePath}\n`;
				content += `// ========================================\n\n`;
			}

			content += cleanedContent;
			content += "\n\n";
		});

		return content;
	}

	/**
	 * Gera a renderização do componente principal
	 */
	private generateMainComponentRender(
		component: string,
		isJavaScript: boolean
	): string {
		if (isJavaScript) {
			return `\n\nctx.render(<${component} />);`;
		} else {
			return `\n\nexport { ${component} };`;
		}
	}

	/**
	 * Salva o bundle no disco
	 */
	private async saveBundle(
		result: BundleResult,
		fileName: string
	): Promise<void> {
		const firstFileDir = PathUtils.dirname(this.firstFileRelativePath);
		const outputSubDir = PathUtils.join(this.outputDir, firstFileDir);

		FileProcessor.ensureDirectory(outputSubDir);

		const isTypeScript = fileName.endsWith(".tsx");
		const formattedContent = await CodeFormatter.format(
			result.content,
			isTypeScript
		);

		const outputPath = PathUtils.join(outputSubDir, fileName);
		FileProcessor.writeFile(outputPath, formattedContent);

		Logger.file(`${fileName} salvo: ${outputPath}`);
	}

	/**
	 * Imprime relatório final
	 */
	private printReport(
		tsResult: BundleResult,
		jsResult: BundleResult,
		sortedFiles: string[]
	): void {
		Logger.separator();
		Logger.section("📊 Relatório de Bundling");

		Logger.stats("Arquivos processados", sortedFiles.length);
		Logger.stats(
			"Componente principal",
			tsResult.mainComponent || "Não detectado"
		);
		Logger.stats("Tamanho TypeScript", `${tsResult.sizeKB.toFixed(2)} KB`);
		Logger.stats("Tamanho JavaScript", `${jsResult.sizeKB.toFixed(2)} KB`);

		Logger.separator();
		Logger.info("Arquivos em ordem de dependência:");
		sortedFiles.forEach((filePath, index) => {
			const fileInfo = this.files.get(filePath);
			if (fileInfo) {
				console.log(`   ${index + 1}. ${fileInfo.relativePath}`);
			}
		});
	}
}
