import { ImportAnalyzer } from "./ImportAnalyzer";
import { UsageAnalyzer } from "./UsageAnalyzer";

/**
 * Analisador principal de código que coordena diferentes análises
 */
export class CodeAnalyzer {
	/**
	 * Analisa imports externos de múltiplos arquivos
	 */
	public analyzeImports(files: Map<string, string>): Map<string, Set<string>> {
		return ImportAnalyzer.analyzeExternalImports(files);
	}

	/**
	 * Gera declarações de import formatadas
	 */
	public generateImportStatements(
		imports: Map<string, Set<string>>
	): string {
		return ImportAnalyzer.generateImportStatements(imports);
	}

	/**
	 * Analisa uso de identificadores no código
	 */
	public analyzeUsage(content: string): Set<string> {
		return UsageAnalyzer.analyzeUsage(content);
	}

	/**
	 * Analisa declarações no código
	 */
	public analyzeDeclared(content: string): Set<string> {
		return UsageAnalyzer.analyzeDeclared(content);
	}

	/**
	 * Remove imports não utilizados
	 */
	public removeUnusedImports(
		content: string,
		usedIdentifiers: Set<string>
	): string {
		return ImportAnalyzer.removeUnusedImports(content, usedIdentifiers);
	}

	/**
	 * Analisa estatísticas de uso do código
	 */
	public getStatistics(content: string) {
		return UsageAnalyzer.analyzeStatistics(content);
	}

	/**
	 * Encontra declarações não utilizadas
	 */
	public findUnusedDeclarations(content: string): Set<string> {
		return UsageAnalyzer.findUnusedDeclarations(content);
	}
}
