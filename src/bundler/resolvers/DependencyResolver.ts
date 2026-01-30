import * as fs from "fs";
import * as path from "path";
import { FileInfo } from "../core/types";
import { Logger } from "@/common/Logger";
import { ReExportAnalyzer } from "../analyzers/ReExportAnalyzer";
import { ModuleResolver } from "./ModuleResolver";
import { ImportAnalyzer } from "../analyzers/ImportAnalyzer";

/**
 * Resolve dependências entre arquivos
 */
export class DependencyResolver {
	/**
	 * Resolve o caminho real de um import relativo
	 * @deprecated Use ModuleResolver.resolve() ao invés
	 */
	public static resolveImportPath(
		fromFile: string,
		importPath: string,
	): string | null {
		return ModuleResolver.resolve(fromFile, importPath);
	}

	/**
	 * [ Ordena arquivos por dependência usando DFS ]
	 * Considera re-exports de barrel files (index.ts)
	 */
	public static sortFilesByDependency(files: Map<string, FileInfo>): string[] {
		const sorted: string[] = [];
		const visiting = new Set<string>();
		const processedFiles: Set<string> = new Set();

		const visit = (filePath: string) => {
			if (processedFiles.has(filePath)) {
				return;
			}

			if (visiting.has(filePath)) {
				const fileInfo = files.get(filePath);
				const fileName = fileInfo?.relativePath || filePath;
				Logger.warning(`Dependência circular detectada em: ${fileName}`);
				return;
			}

			visiting.add(filePath);

			const fileInfo = files.get(filePath);
			if (!fileInfo) {
				visiting.delete(filePath);
				return;
			}

			const importsWithNames = ImportAnalyzer.extractWithNames(
				fileInfo.content,
			);

			importsWithNames.forEach((importedNames, importPath) => {
				const resolvedFiles = this.resolveImportWithReExports(
					filePath,
					importPath,
					importedNames,
				);

				resolvedFiles.forEach(resolvedPath => {
					if (resolvedPath && files.has(resolvedPath)) {
						visit(resolvedPath);
					}
				});
			});

			visiting.delete(filePath);
			processedFiles.add(filePath);
			sorted.push(filePath);
		};

		Array.from(files.keys()).forEach(filePath => {
			visit(filePath);
		});

		return sorted;
	}

	/**
	 * Verifica se o arquivo resolvido é um index.ts que contém apenas re-exports
	 */
	public static isIndexWithReExports(filePath: string): boolean {
		if (!filePath || !fs.existsSync(filePath)) {
			return false;
		}

		const fileName = path.basename(filePath);
		if (!fileName.match(/^index\.(ts|tsx|js|jsx)$/)) {
			return false;
		}

		const content = fs.readFileSync(filePath, "utf-8");
		return ReExportAnalyzer.isBarrelFile(content);
	}

	/**
	 * Resolve re-exports de um arquivo index.ts
	 * Retorna os arquivos originais onde os exports estão definidos
	 */
	public static resolveReExports(
		indexFilePath: string,
		importedNames?: string[],
	): string[] {
		if (!indexFilePath || !fs.existsSync(indexFilePath)) {
			return [];
		}

		if (importedNames && importedNames.length > 0) {
			return ReExportAnalyzer.getFilesForImports(indexFilePath, importedNames);
		}

		return ReExportAnalyzer.getAllReExportedFiles(indexFilePath);
	}

	/**
	 * Resolve completamente um import, incluindo re-exports de barrel files
	 * Retorna uma lista de todos os arquivos necessários
	 */
	public static resolveImportWithReExports(
		fromFile: string,
		importPath: string,
		importedNames?: string[],
	): string[] {
		const resolvedPath = ModuleResolver.resolve(fromFile, importPath);

		if (!resolvedPath) {
			return [];
		}

		if (this.isIndexWithReExports(resolvedPath)) {
			const reExportedFiles = this.resolveReExports(
				resolvedPath,
				importedNames,
			);

			if (reExportedFiles.length > 0) {
				Logger.info.verbose(
					`Resolvendo re-exports de ${path.basename(resolvedPath)}: ${reExportedFiles.length} arquivo(s)`,
				);
				return reExportedFiles;
			}
		}

		return [resolvedPath];
	}
}
