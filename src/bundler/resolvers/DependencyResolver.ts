import * as fs from "fs";
import * as path from "path";
import { FileInfo } from "../core/types";
import { PathUtils } from "../../common/utils/PathUtils";
import { APP_CONFIG } from "@/config/config";
import { Logger } from "@/common/Logger";
import { ReExportAnalyzer } from "../analyzers/ReExportAnalyzer";

/**
 * Resolve dependências entre arquivos
 */
export class DependencyResolver {
	/**
	 * Resolve o caminho real de um import relativo
	 */
	public static resolveImportPath(
		fromFile: string,
		importPath: string,
	): string | null {
		const fromDir = PathUtils.dirname(fromFile);
		// 1. Tenta resolver como alias
		let resolvedPath: string | null = null;
		if (PathUtils.isAlias(importPath)) {
			resolvedPath = PathUtils.resolveAlias(importPath);
			if (resolvedPath) {
				// Tenta resolver a partir da raiz do projeto
				resolvedPath = PathUtils.resolve(process.cwd(), resolvedPath);
			}
		} else {
			// 2. Caminho relativo normal
			resolvedPath = PathUtils.resolve(fromDir, importPath);
		}

		// Se é um diretório, procura por index.*
		if (resolvedPath && fs.existsSync(resolvedPath)) {
			const stat = fs.statSync(resolvedPath);
			if (stat.isDirectory()) {
				for (const ext of APP_CONFIG.bundler.IMPORT_EXTENSIONS) {
					const indexPath = PathUtils.join(resolvedPath, `index${ext}`);
					if (fs.existsSync(indexPath)) {
						return indexPath;
					}
				}
			}
		}

		// Tenta adicionar extensões
		if (resolvedPath) {
			for (const ext of APP_CONFIG.bundler.IMPORT_EXTENSIONS) {
				const pathWithExt = resolvedPath + ext;
				if (fs.existsSync(pathWithExt)) {
					return pathWithExt;
				}
			}
			// Se já existe como está
			if (fs.existsSync(resolvedPath)) {
				return resolvedPath;
			}
		}

		return null;
	}

	/**
	 * [ Ordena arquivos por dependência usando DFS ]
	 * Considera re-exports de barrel files (index.ts)
	 */
	public static sortFilesByDependency(files: Map<string, FileInfo>): string[] {
		const sorted: string[] = [];
		const visiting = new Set<string>();
		const processedFiles: Set<string> = new Set();

		const extractImportsWithNames = (
			content: string,
		): Map<string, string[]> => {
			const importsMap = new Map<string, string[]>();
			const importRegex =
				/import\s+(?:(\{[^}]*\})|(\*\s+as\s+\w+)|(\w+))(?:\s*,\s*(?:(\{[^}]*\})|(\*\s+as\s+\w+)))*\s+from\s+['"]([^'"]+)['"]/g;

			let match;
			while ((match = importRegex.exec(content)) !== null) {
				const importPath = match[6];
				if (
					!PathUtils.isRelativePath(importPath) &&
					!PathUtils.isAlias(importPath)
				) {
					continue;
				}

				const names: string[] = [];

				if (match[1]) {
					const namedImports = match[1].replace(/[{}]/g, "").split(",");
					namedImports.forEach(name => {
						const trimmed = name.trim();
						if (trimmed) {
							const asMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
							if (asMatch) {
								names.push(asMatch[1]);
							} else {
								names.push(trimmed);
							}
						}
					});
				}

				if (match[3]) {
					names.push(match[3]);
				}

				if (match[4]) {
					const namedImports = match[4].replace(/[{}]/g, "").split(",");
					namedImports.forEach(name => {
						const trimmed = name.trim();
						if (trimmed) {
							const asMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
							if (asMatch) {
								names.push(asMatch[1]);
							} else {
								names.push(trimmed);
							}
						}
					});
				}

				if (importsMap.has(importPath)) {
					const existing = importsMap.get(importPath)!;
					names.forEach(n => {
						if (!existing.includes(n)) {
							existing.push(n);
						}
					});
				} else {
					importsMap.set(importPath, names);
				}
			}

			return importsMap;
		};

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

			const importsWithNames = extractImportsWithNames(fileInfo.content);

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

		// Visita todos os arquivos
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
		const resolvedPath = this.resolveImportPath(fromFile, importPath);

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
