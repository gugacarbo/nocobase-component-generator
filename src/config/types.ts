export interface AppConfig {
	loggerVerbose: boolean;
	componentsPath: string;
	supportedExtensions: readonly string[];
	bundler: BundlerConfig;
	server: {
		host: string;
		bundleApiEndpoint: string;
		port: number;
	};
}

export interface BundlerConfig {
	LIBRARY_MAPPINGS: Record<string, string>;
	EXCLUDED_FILES: string[];
	EXCLUDED_DIRS: string[];
	FILE_EXTENSIONS: RegExp;
	IMPORT_EXTENSIONS: string[];
	PRETTIER_CONFIG: Record<string, any>;
	IGNORED_MODULES: string[];
	OUTPUT_EXTENSION: string;
	TEMP_FILE_NAME: string;
	MOCK_TEST_PATTERN: RegExp;
	BUNDLE_ONLY_PATTERN: RegExp;
	NO_BUNDLE_PATTERN: RegExp;
	exportTypescript: boolean;
	aliases: Record<string, string[]>;
}
