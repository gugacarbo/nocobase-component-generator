import { APP_CONFIG } from "@/config/config";

/**
 * Validador de arquivos e diretórios para o bundler
 * Centraliza lógica de exclusão e validação
 */
export class FileValidator {
	/**
	 * Verifica se um arquivo deve ser excluído do bundle
	 */
	public static shouldExcludeFile(fileName: string): boolean {
		return APP_CONFIG.bundler.EXCLUDED_FILES.some(excluded =>
			fileName.includes(excluded),
		);
	}

	/**
	 * Verifica se um diretório deve ser excluído da busca
	 */
	public static shouldExcludeDir(dirPath: string): boolean {
		return APP_CONFIG.bundler.EXCLUDED_DIRS.some(excluded =>
			dirPath.includes(excluded),
		);
	}

	/**
	 * Verifica se um arquivo tem extensão suportada
	 */
	public static isSupportedFile(fileName: string): boolean {
		return APP_CONFIG.bundler.FILE_EXTENSIONS.test(fileName);
	}

	/**
	 * Verifica se um arquivo é de mock ou test
	 */
	public static isMockOrTestFile(filePath: string): boolean {
		return APP_CONFIG.bundler.MOCK_TEST_PATTERN.test(filePath);
	}

	/**
	 * Verifica se um módulo deve ser ignorado
	 */
	public static shouldIgnoreModule(moduleName: string): boolean {
		return APP_CONFIG.bundler.IGNORED_MODULES.some(
			ignored => moduleName === ignored || moduleName.includes(ignored),
		);
	}
}
