import * as fs from "fs";
import { FileInfo } from "../core/types";
import { PathUtils } from "../../common/utils/PathUtils";
import { APP_CONFIG } from "@/config/config";

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
		let resolvedPath = PathUtils.resolve(fromDir, importPath);

		// Se é um diretório, procura por index.*
		if (fs.existsSync(resolvedPath)) {
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
		for (const ext of APP_CONFIG.bundler.IMPORT_EXTENSIONS) {
			const pathWithExt = resolvedPath + ext;
			if (fs.existsSync(pathWithExt)) {
				return pathWithExt;
			}
		}

		return null;
	}

	/**
	 * [ Ordena arquivos por dependência usando DFS ]
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
				// Dependência circular detectada - ignora
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
			processedFiles.add(filePath);
			sorted.push(filePath);
		};

		// Visita todos os arquivos
		Array.from(files.keys()).forEach(filePath => {
			visit(filePath);
		});

		return sorted;
	}
}
