import * as ts from "typescript";
import * as fs from "fs";
import { APP_CONFIG } from "@/config/config";
import { PathUtils } from "@common/utils/PathUtils";
import { ModuleResolver } from "../resolvers/ModuleResolver";
import { ReExportInfo } from "../core/types";

export class ReExportAnalyzer {
	/**
	 * Analisa um arquivo e extrai informações sobre re-exports
	 * (ex: export { Foo } from './foo' ou export { Foo as Bar } from './foo')
	 */
	public static extractReExports(content: string): ReExportInfo[] {
		const reExports: ReExportInfo[] = [];

		const sourceFile = ts.createSourceFile(
			APP_CONFIG.bundler.TEMP_FILE_NAME,
			content,
			ts.ScriptTarget.Latest,
			true,
			ts.ScriptKind.TSX,
		);

		const visit = (node: ts.Node) => {
			if (ts.isExportDeclaration(node)) {
				const reExportInfo = this.parseExportDeclaration(node);
				if (reExportInfo.length > 0) {
					reExports.push(...reExportInfo);
				}
			}
			ts.forEachChild(node, visit);
		};

		visit(sourceFile);
		return reExports;
	}

	/**
	 * Verifica se um arquivo é um barrel file (index.ts que só contém re-exports)
	 */
	public static isBarrelFile(content: string): boolean {
		const trimmed = content.trim();
		if (!trimmed) return false;

		const lines = trimmed.split("\n").filter(line => {
			const l = line.trim();
			return (
				l && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*")
			);
		});

		return lines.every(line => {
			const l = line.trim();
			return (
				l.startsWith("export {") ||
				l.startsWith("export *") ||
				l.startsWith("export type") ||
				l.startsWith("}") ||
				l.includes("} from") ||
				l === "" ||
				/^\w+,$/.test(l) ||
				/^\w+\s*$/.test(l)
			);
		});
	}

	/**
	 * Resolve os re-exports de um arquivo index.ts para os arquivos originais
	 * Resolve recursivamente barrel files aninhados
	 * Retorna um mapa: nome exportado -> caminho do arquivo original
	 */
	public static resolveReExportsToFiles(
		indexFilePath: string,
		requestedNames?: string[],
		visited: Set<string> = new Set(),
	): Map<string, string> {
		const resolvedPaths = new Map<string, string>();

		if (!fs.existsSync(indexFilePath) || visited.has(indexFilePath)) {
			return resolvedPaths;
		}

		visited.add(indexFilePath);

		const content = fs.readFileSync(indexFilePath, "utf-8");
		const reExports = this.extractReExports(content);
		const indexDir = PathUtils.dirname(indexFilePath);

		for (const reExport of reExports) {
			const isStarExport = reExport.exportedName === "*";

			if (
				!isStarExport &&
				requestedNames &&
				!requestedNames.includes(reExport.exportedName)
			) {
				continue;
			}

			const resolvedPath = ModuleResolver.resolvePath(
				indexDir,
				reExport.sourceModule,
			);

			if (!resolvedPath) continue;

			const resolvedContent = fs.readFileSync(resolvedPath, "utf-8");
			const isNestedBarrel = this.isBarrelFile(resolvedContent);

			if (isStarExport) {
				if (isNestedBarrel) {
					const nestedResults = this.resolveReExportsToFiles(
						resolvedPath,
						requestedNames,
						visited,
					);
					nestedResults.forEach((nestedPath, name) => {
						resolvedPaths.set(name, nestedPath);
					});
				} else {
					resolvedPaths.set(`*:${resolvedPath}`, resolvedPath);
				}
			} else if (isNestedBarrel) {
				const nestedResults = this.resolveReExportsToFiles(
					resolvedPath,
					[reExport.originalName],
					visited,
				);

				if (nestedResults.size > 0) {
					nestedResults.forEach((nestedPath, _) => {
						resolvedPaths.set(reExport.exportedName, nestedPath);
					});
				} else {
					resolvedPaths.set(reExport.exportedName, resolvedPath);
				}
			} else {
				reExport.resolvedPath = resolvedPath;
				resolvedPaths.set(reExport.exportedName, resolvedPath);
			}
		}

		return resolvedPaths;
	}

	/**
	 * Dado um import de um barrel file (index.ts), retorna todos os arquivos
	 * que devem ser incluídos baseado nos nomes importados
	 */
	public static getFilesForImports(
		indexFilePath: string,
		importedNames: string[],
	): string[] {
		const resolvedMap = this.resolveReExportsToFiles(
			indexFilePath,
			importedNames,
		);
		return [...new Set(resolvedMap.values())];
	}

	/**
	 * Extrai todos os arquivos que são re-exportados por um index.ts
	 */
	public static getAllReExportedFiles(indexFilePath: string): string[] {
		const resolvedMap = this.resolveReExportsToFiles(indexFilePath);
		return [...new Set(resolvedMap.values())];
	}

	private static parseExportDeclaration(
		node: ts.ExportDeclaration,
	): ReExportInfo[] {
		const results: ReExportInfo[] = [];

		if (!node.moduleSpecifier || !ts.isStringLiteral(node.moduleSpecifier)) {
			return results;
		}

		const sourceModule = node.moduleSpecifier.text;

		if (
			!PathUtils.isRelativePath(sourceModule) &&
			!PathUtils.isAlias(sourceModule)
		) {
			return results;
		}

		if (node.exportClause) {
			if (ts.isNamedExports(node.exportClause)) {
				node.exportClause.elements.forEach(element => {
					const exportedName = element.name.text;
					const originalName = element.propertyName
						? element.propertyName.text
						: exportedName;

					results.push({
						exportedName,
						originalName,
						sourceModule,
						resolvedPath: null,
					});
				});
			}
		} else {
			results.push({
				exportedName: "*",
				originalName: "*",
				sourceModule,
				resolvedPath: null,
			});
		}

		return results;
	}
}
