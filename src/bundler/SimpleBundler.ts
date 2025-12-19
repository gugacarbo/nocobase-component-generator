import * as fs from "fs";
import * as path from "path";
import { FileInfo, BundleOptions } from "./types";
import { FileProcessor } from "./FileProcessor";
import { DependencyResolver } from "./DependencyResolver";
import { CodeAnalyzer } from "./CodeAnalyzer";
import { TreeShaker } from "./TreeShaker";
import { ComponentDetector } from "./ComponentDetector";
import { CodeFormatter } from "./CodeFormatter";
import { NocoBaseTransformer } from "./NocoBaseTransformer";

/**
 * Bundler simples que concatena arquivos em ordem de dependência
 */
export class SimpleBundler {
	private srcPath: string;
	private outputDir: string;
	private files: Map<string, FileInfo> = new Map();
	private dependencyResolver: DependencyResolver;
	private codeAnalyzer: CodeAnalyzer;
	private treeShaker: TreeShaker;
	private firstFileRelativePath: string = "";
	private isFile: boolean;

	constructor(srcPath: string, outputDir: string) {
		this.srcPath = srcPath;
		this.outputDir = outputDir;
		this.isFile = fs.existsSync(srcPath) && fs.statSync(srcPath).isFile();
		this.dependencyResolver = new DependencyResolver();
		this.codeAnalyzer = new CodeAnalyzer();
		this.treeShaker = new TreeShaker();
	}

	/**
	 * Carrega todos os arquivos do projeto
	 */
	private loadFiles(): void {
		if (this.isFile) {
			// Se for um arquivo específico, carrega apenas ele
			const baseDir = path.dirname(this.srcPath);
			const fileInfo = FileProcessor.loadFileInfo(this.srcPath, baseDir);
			this.files.set(this.srcPath, fileInfo);
			this.firstFileRelativePath = fileInfo.relativePath;
		} else {
			// Se for um diretório, processa todos os arquivos
			const allFiles = FileProcessor.findFiles(this.srcPath);

			allFiles.forEach((filePath, index) => {
				const fileInfo = FileProcessor.loadFileInfo(filePath, this.srcPath);
				this.files.set(filePath, fileInfo);

				// Captura o caminho relativo do primeiro arquivo
				if (index === 0) {
					this.firstFileRelativePath = fileInfo.relativePath;
				}
			});
		}
	}

	/**
	 * Gera o conteúdo do bundle
	 */
	private generateBundleContent(
		sortedFiles: string[],
		options: BundleOptions,
	): string {
		const withoutTypes = options.removeTypes;

		const versionLabel = withoutTypes
			? "JavaScript (sem TypeScript)"
			: "Com TypeScript";

		// Analisa imports externos necessários
		const fileContents = new Map<string, string>();
		sortedFiles.forEach(filePath => {
			const fileInfo = this.files.get(filePath);
			if (fileInfo) {
				fileContents.set(filePath, fileInfo.content);
			}
		});

		const externalImports = this.codeAnalyzer.analyzeImports(fileContents);
		const importStatements =
			this.codeAnalyzer.generateImportStatements(externalImports);

		// Cabeçalho
		let content = "";
		if (!withoutTypes) {
			content += "// Componente gerado pelo NocoBase Component Generator\n";
			content += `// Data: ${new Date().toLocaleString("pt-BR")}\n`;
			content += `// Versão: ${versionLabel}\n\n`;
		}

		// Adiciona imports
		if (importStatements) {
			content += importStatements;
		}

		// Concatena todos os arquivos
		let codeContent = "";

		sortedFiles.forEach(filePath => {
			const fileInfo = this.files.get(filePath);
			if (!fileInfo) return;

			const cleanedContent = FileProcessor.cleanContent(
				fileInfo.content,
				fileInfo.relativePath,
				withoutTypes,
			);

			if (!withoutTypes) {
				codeContent += `// ========================================\n`;
				codeContent += `// Arquivo: ${fileInfo.relativePath}\n`;
				codeContent += `// ========================================\n\n`;
			}
			codeContent += cleanedContent;
			codeContent += "\n\n";
		});

		// Remove código não utilizado (tree shaking)
		codeContent = this.treeShaker.shake(codeContent);

		content += codeContent;

		// Verifica quais imports são realmente usados no código final
		const usedIdentifiers = this.codeAnalyzer.analyzeUsage(content);
		content = this.codeAnalyzer.removeUnusedImports(content, usedIdentifiers);

		// Transforma imports para usar a API do NocoBase (ctx.libraries)
		if (withoutTypes) {
			content = NocoBaseTransformer.transformImports(content);
		}

		// Identifica o componente principal
		const mainComponent = ComponentDetector.findMainComponent(fileContents);

		// Adiciona ctx.render() com o componente principal
		if (mainComponent) {
			if (withoutTypes) {
				content += `\n\nctx.render(<${mainComponent} />);`;
			} else {
				content += `\n\n export { ${mainComponent} } `;
			}
		}

		return content;
	}

	/**
	 * Converte nome do componente para kebab-case
	 */
	private toKebabCase(str: string): string {
		return str
			.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
			.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
			.toLowerCase();
	}

	/**
	 * Salva o bundle no disco com formatação
	 */
	private async saveBundle(content: string, fileName: string): Promise<string> {
		// Cria o caminho de saída preservando a estrutura de diretórios da origem
		// Extrai o diretório do primeiro arquivo processado
		const firstFileDir = path.dirname(this.firstFileRelativePath);
		const outputSubDir = path.join(this.outputDir, firstFileDir);

		// Garante que a pasta output existe com a estrutura de diretórios
		if (!fs.existsSync(outputSubDir)) {
			fs.mkdirSync(outputSubDir, { recursive: true });
		}

		// Formata o código antes de salvar
		const isTypeScript = fileName.endsWith(".tsx");
		const formattedContent = await CodeFormatter.format(content, isTypeScript);

		const outputPath = path.join(outputSubDir, fileName);
		fs.writeFileSync(outputPath, formattedContent, "utf-8");

		return outputPath;
	}

	/**
	 * Gera os bundles (TypeScript e JavaScript)
	 */
	public async bundle(): Promise<void> {
		console.log("🚀 Iniciando bundler simples...\n");

		// Carrega todos os arquivos
		this.loadFiles();
		console.log(`📁 Encontrados ${this.files.size} arquivos\n`);

		// Ordena por dependência
		const sortedFiles = this.dependencyResolver.sortFilesByDependency(
			this.files,
		);

		// Detecta o componente principal para usar como nome do arquivo
		const fileContents = new Map<string, string>();
		sortedFiles.forEach(filePath => {
			const fileInfo = this.files.get(filePath);
			if (fileInfo) {
				fileContents.set(filePath, fileInfo.content);
			}
		});
		const mainComponent = ComponentDetector.findMainComponent(fileContents);
		const componentFileName = mainComponent
			? this.toKebabCase(mainComponent)
			: "bundled-component";

		// Gera versão TypeScript
		const bundledContentTS = this.generateBundleContent(sortedFiles, {
			removeTypes: false,
			outputFileName: `${componentFileName}.tsx`,
		});

		// Gera versão JavaScript
		const bundledContentJS = this.generateBundleContent(sortedFiles, {
			removeTypes: true,
			outputFileName: `${componentFileName}.jsx`,
		});

		// Salva os arquivos com formatação
		const outputPathTS = await this.saveBundle(
			bundledContentTS,
			`${componentFileName}.tsx`,
		);
		const outputPathJS = await this.saveBundle(
			bundledContentJS,
			`${componentFileName}.jsx`,
		);

		// Exibe resultados
		this.printResults(
			outputPathTS,
			outputPathJS,
			bundledContentTS,
			bundledContentJS,
			sortedFiles,
		);
	}

	/**
	 * Exibe os resultados do bundling
	 */
	private printResults(
		outputPathTS: string,
		outputPathJS: string,
		contentTS: string,
		contentJS: string,
		sortedFiles: string[],
	): void {
		console.log("✅ Bundles gerados com sucesso!");
		console.log(`\n📄 Versão TypeScript: ${outputPathTS}`);
		console.log(`   📏 Tamanho: ${(contentTS.length / 1024).toFixed(2)} KB`);
		console.log(`\n📄 Versão JavaScript: ${outputPathJS}`);
		console.log(`   📏 Tamanho: ${(contentJS.length / 1024).toFixed(2)} KB`);
		console.log(`\n📊 Total de arquivos processados: ${sortedFiles.length}`);

		console.log("\n📋 Arquivos processados (em ordem de dependência):");
		sortedFiles.forEach((filePath, index) => {
			const fileInfo = this.files.get(filePath);
			if (fileInfo) {
				console.log(`   ${index + 1}. ${fileInfo.relativePath}`);
			}
		});
	}
}
