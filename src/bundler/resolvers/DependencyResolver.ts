import * as fs from "fs";
import { FileInfo } from "../types";
import { PathUtils } from "../utils/PathUtils";
import { BundlerConfig } from "../config/BundlerConfig";

/**
 * Resolve dependências entre arquivos
 */
export class DependencyResolver {
	private processedFiles: Set<string> = new Set();

	/**
	 * Resolve o caminho real de um import relativo
	 */
	public static resolveImportPath(
		fromFile: string,
		importPath: string
	): string | null {
		const fromDir = PathUtils.dirname(fromFile);
		let resolvedPath = PathUtils.resolve(fromDir, importPath);

		// Se é um diretório, procura por index.*
		if (fs.existsSync(resolvedPath)) {
			const stat = fs.statSync(resolvedPath);
			if (stat.isDirectory()) {
				for (const ext of BundlerConfig.IMPORT_EXTENSIONS) {
					const indexPath = PathUtils.join(resolvedPath, `index${ext}`);
					if (fs.existsSync(indexPath)) {
						return indexPath;
					}
				}
			}
		}

		// Tenta adicionar extensões
		for (const ext of BundlerConfig.IMPORT_EXTENSIONS) {
			const pathWithExt = resolvedPath + ext;
			if (fs.existsSync(pathWithExt)) {
				return pathWithExt;
			}
		}

		return null;
	}

	/**
	 * Ordena arquivos por dependência usando DFS
	 */
	public sortFilesByDependency(files: Map<string, FileInfo>): string[] {
		const sorted: string[] = [];
		const visiting = new Set<string>();
		this.processedFiles = new Set();

		const visit = (filePath: string) => {
			if (this.processedFiles.has(filePath)) {
				return;
			}

			if (visiting.has(filePath)) {
				// Dependência circular detectada - ignora
				return;
			}

			visiting.add(filePath);

			const fileInfo = files.get(filePath);
			if (!fileInfo) {
				return;
			}

			// Visita dependências primeiro
			fileInfo.imports.forEach((importPath) => {
				const resolvedPath = DependencyResolver.resolveImportPath(
					filePath,
					importPath
				);
				if (resolvedPath && files.has(resolvedPath)) {
					visit(resolvedPath);
				}
			});

			visiting.delete(filePath);
			this.processedFiles.add(filePath);
			sorted.push(filePath);
		};

		// Visita todos os arquivos
		Array.from(files.keys()).forEach((filePath) => {
			visit(filePath);
		});

		return sorted;
	}

	/**
	 * Constrói um grafo de dependências
	 */
	public buildDependencyGraph(
		files: Map<string, FileInfo>
	): Map<string, Set<string>> {
		const graph = new Map<string, Set<string>>();

		files.forEach((fileInfo, filePath) => {
			if (!graph.has(filePath)) {
				graph.set(filePath, new Set());
			}

			fileInfo.imports.forEach((importPath) => {
				const resolvedPath = DependencyResolver.resolveImportPath(
					filePath,
					importPath
				);
				if (resolvedPath && files.has(resolvedPath)) {
					graph.get(filePath)!.add(resolvedPath);
				}
			});
		});

		return graph;
	}

	/**
	 * Detecta dependências circulares
	 */
	public detectCircularDependencies(
		files: Map<string, FileInfo>
	): string[][] {
		const graph = this.buildDependencyGraph(files);
		const cycles: string[][] = [];
		const visited = new Set<string>();
		const recursionStack = new Set<string>();
		const currentPath: string[] = [];

		const visit = (node: string) => {
			if (recursionStack.has(node)) {
				// Encontrou ciclo
				const cycleStart = currentPath.indexOf(node);
				if (cycleStart !== -1) {
					cycles.push([...currentPath.slice(cycleStart), node]);
				}
				return;
			}

			if (visited.has(node)) {
				return;
			}

			visited.add(node);
			recursionStack.add(node);
			currentPath.push(node);

			const dependencies = graph.get(node) || new Set();
			dependencies.forEach((dep) => visit(dep));

			currentPath.pop();
			recursionStack.delete(node);
		};

		graph.forEach((_, node) => visit(node));

		return cycles;
	}

	/**
	 * Obtém todas as dependências de um arquivo (recursivo)
	 */
	public getAllDependencies(
		filePath: string,
		files: Map<string, FileInfo>
	): Set<string> {
		const dependencies = new Set<string>();
		const visited = new Set<string>();

		const visit = (path: string) => {
			if (visited.has(path)) {
				return;
			}

			visited.add(path);
			const fileInfo = files.get(path);

			if (fileInfo) {
				fileInfo.imports.forEach((importPath) => {
					const resolvedPath = DependencyResolver.resolveImportPath(
						path,
						importPath
					);
					if (resolvedPath && files.has(resolvedPath)) {
						dependencies.add(resolvedPath);
						visit(resolvedPath);
					}
				});
			}
		};

		visit(filePath);
		return dependencies;
	}
}
