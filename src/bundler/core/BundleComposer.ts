import { Logger } from "@/common/Logger";
import { type BundlePipelineContext } from "./types";
import { NocoBaseAdapter } from "../adapters/NocoBaseAdapter";
import { ContentProcessor } from "../processors/ContentProcessor";
import { CommentProcessor } from "../processors/CommentProcessor";
import { TreeShaker } from "../processors/TreeShaker";
import { ExportProcessor } from "../processors/ExportProcessor";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";

/**
 * Stage do pipeline de bundling
 */
interface BundleStage {
	name: string;
	execute: (content: string) => string | Promise<string>;
}

/**
 * Compositor modular para o pipeline de bundling
 * Torna fácil adicionar, remover ou reordenar etapas
 */
export class BundleComposer {
	private stages: BundleStage[] = [];

	/**
	 * Adiciona header do NocoBase
	 */
	addHeader(): this {
		this.stages.push({
			name: "Header",
			execute: () => NocoBaseAdapter.generateBundleHeader(),
		});
		return this;
	}

	/**
	 * Concatena arquivos do contexto
	 */
	addFilesConcatenation(
		context: BundlePipelineContext,
		isJavaScript: boolean,
	): this {
		this.stages.push({
			name: "Concatenação de Arquivos",
			execute: () =>
				ContentProcessor.concatenateFiles(
					context.sortedFiles,
					context.files,
					isJavaScript,
				),
		});
		return this;
	}

	/**
	 * Processa comentários especiais
	 */
	addCommentProcessing(): this {
		this.stages.push({
			name: "Processamento de Comentários",
			execute: content => CommentProcessor.processComments(content),
		});
		return this;
	}

	/**
	 * Aplica tree shaking
	 */
	addTreeShaking(mainComponent: string): this {
		this.stages.push({
			name: "Tree Shaking",
			execute: content => TreeShaker.shake(content, mainComponent),
		});
		return this;
	}

	/**
	 * Extrai e adiciona defaultProps
	 */
	addDefaultProps(): this {
		this.stages.push({
			name: "Extração de DefaultProps",
			execute: content => {
				const { defaultProps, contentWithout } =
					ExportProcessor.extractDefaultProps(content);
				const result =
					(defaultProps ? defaultProps + "\n\n" : "") + contentWithout;
				return result;
			},
		});
		return this;
	}

	/**
	 * Adiciona export do componente principal
	 */
	addComponentExport(
		mainComponent: string,
		isJavaScript: boolean,
		defaultProps?: string | null,
	): this {
		this.stages.push({
			name: "Export do Componente",
			execute: content => {
				if (isJavaScript) {
					return (
						content +
						NocoBaseAdapter.generateRender(mainComponent, defaultProps)
					);
				} else {
					return content + NocoBaseAdapter.generateExport(mainComponent);
				}
			},
		});
		return this;
	}

	/**
	 * Adiciona imports externos
	 */
	addExternalImports(externalImports: Map<string, Set<string>>): this {
		this.stages.push({
			name: "Imports Externos",
			execute: content =>
				content + ImportAnalyzer.generateImportStatements(externalImports),
		});
		return this;
	}

	/**
	 * Transforma imports para NocoBase (apenas JavaScript)
	 */
	addNocoBaseTransformation(): this {
		this.stages.push({
			name: "Transformação NocoBase",
			execute: content => NocoBaseAdapter.transformImports(content),
		});
		return this;
	}

	/**
	 * Stage customizado
	 */
	addCustomStage(name: string, execute: (content: string) => string): this {
		this.stages.push({ name, execute });
		return this;
	}

	/**
	 * Executa o pipeline completo
	 */
	async compose(): Promise<string> {
		let result = "";

		for (const stage of this.stages) {
			try {
				const stageResult = await stage.execute(result);
				result = stageResult;
				Logger.info.verbose(`✓ ${stage.name}`);
			} catch (error) {
				const err = error instanceof Error ? error : new Error(String(error));
				Logger.error(`Erro em ${stage.name}`, err);
				throw err;
			}
		}

		if (!result || result.trim() === "") {
			throw new Error("Bundle gerado está vazio");
		}

		Logger.success.verbose(
			`Bundle compilado: ${(result.length / 1024).toFixed(2)} KB`,
		);

		return result;
	}

	/**
	 * Retorna a lista de stages para debug
	 */
	getStages(): string[] {
		return this.stages.map(s => s.name);
	}
}
