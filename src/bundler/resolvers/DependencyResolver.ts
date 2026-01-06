import * as fs from "fs";
import { FileInfo } from "../core/types";
import { PathUtils } from "../../common/utils/PathUtils";
import { APP_CONFIG } from "@/config/config";
import { Logger } from "@/common/Logger";

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
				// Dependência circular detectada
				const fileInfo = files.get(filePath);
				const fileName = fileInfo?.relativePath || filePath;
				Logger.warning(`Dependência circular detectada em: ${fileName}`);
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
