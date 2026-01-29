import * as fs from "fs";
import { PathUtils } from "@/common/utils/PathUtils";
import { APP_CONFIG } from "@/config/config";

/**
 * Resolve caminhos de módulos de forma centralizada
 * Elimina duplicação entre DependencyResolver e ReExportAnalyzer
 */
export class ModuleResolver {
	/**
	 * Resolve o caminho completo de um módulo a partir de um arquivo fonte
	 * Suporta: caminhos relativos, aliases, diretórios (index.*) e extensões
	 */
	public static resolve(fromFile: string, importPath: string): string | null {
		const fromDir = PathUtils.dirname(fromFile);
		return this.resolvePath(fromDir, importPath);
	}

	/**
	 * Resolve um caminho de módulo a partir de um diretório base
	 */
	public static resolvePath(
		fromDir: string,
		importPath: string,
	): string | null {
		let resolvedPath = this.resolveInitialPath(fromDir, importPath);
		if (!resolvedPath) return null;

		return (
			this.resolveAsDirectory(resolvedPath) ||
			this.resolveWithExtensions(resolvedPath) ||
			this.resolveAsIs(resolvedPath)
		);
	}

	/**
	 * Verifica se um módulo é externo (de node_modules)
	 */
	public static isExternal(importPath: string): boolean {
		return (
			!PathUtils.isRelativePath(importPath) && !PathUtils.isAlias(importPath)
		);
	}

	/**
	 * Verifica se um módulo é local (relativo ou alias)
	 */
	public static isLocal(importPath: string): boolean {
		return (
			PathUtils.isRelativePath(importPath) || PathUtils.isAlias(importPath)
		);
	}

	private static resolveInitialPath(
		fromDir: string,
		importPath: string,
	): string | null {
		if (PathUtils.isAlias(importPath)) {
			const aliasPath = PathUtils.resolveAlias(importPath);
			return aliasPath ? PathUtils.resolve(process.cwd(), aliasPath) : null;
		}
		return PathUtils.resolve(fromDir, importPath);
	}

	private static resolveAsDirectory(resolvedPath: string): string | null {
		if (!fs.existsSync(resolvedPath)) return null;

		try {
			const stat = fs.statSync(resolvedPath);
			if (!stat.isDirectory()) return null;

			for (const ext of APP_CONFIG.bundler.IMPORT_EXTENSIONS) {
				const indexPath = PathUtils.join(resolvedPath, `index${ext}`);
				if (fs.existsSync(indexPath)) {
					return indexPath;
				}
			}
		} catch {
			return null;
		}
		return null;
	}

	private static resolveWithExtensions(resolvedPath: string): string | null {
		for (const ext of APP_CONFIG.bundler.IMPORT_EXTENSIONS) {
			const pathWithExt = resolvedPath + ext;
			if (fs.existsSync(pathWithExt)) {
				return pathWithExt;
			}
		}
		return null;
	}

	private static resolveAsIs(resolvedPath: string): string | null {
		return fs.existsSync(resolvedPath) ? resolvedPath : null;
	}
}
