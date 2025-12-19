import * as fs from "fs";
import * as path from "path";
import {FileInfo} from "./types";

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
		importPath: string,
	): string | null {
		const fromDir = path.dirname(fromFile);
		let resolvedPath = path.resolve(fromDir, importPath);

		// Tenta adicionar extensões se não existir
		const extensions = [".tsx", ".ts", ".jsx", ".js"];

		if (fs.existsSync(resolvedPath)) {
			const stat = fs.statSync(resolvedPath);
			if (stat.isDirectory()) {
				for (const ext of extensions) {
					const indexPath = path.join(resolvedPath, `index${ext}`);
					if (fs.existsSync(indexPath)) {
						return indexPath;
					}
				}
			}
		}

		for (const ext of extensions) {
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
				// Dependência circular - ignora
				return;
			}

			visiting.add(filePath);

			const fileInfo = files.get(filePath);
			if (!fileInfo) {
				return;
			}

			// Visita dependências primeiro
			fileInfo.imports.forEach(importPath => {
				const resolvedPath = DependencyResolver.resolveImportPath(
					filePath,
					importPath,
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
		Array.from(files.keys()).forEach(filePath => {
			visit(filePath);
		});

		return sorted;
	}
}
