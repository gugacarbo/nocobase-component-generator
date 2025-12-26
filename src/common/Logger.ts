import { APP_CONFIG } from "@/config/config";
import chalk from "chalk";

type LogMethod = {
	(message: string, emoji?: string): void;
	verbose: (message: string, emoji?: string) => void;
};

type StatsMethod = {
	(label: string, value: string | number): void;
	verbose: (label: string, value: string | number) => void;
};

type ErrorMethod = {
	(message: string, error?: Error | unknown, emoji?: string): void;
	verbose: (message: string, error?: Error | unknown, emoji?: string) => void;
};

export class Logger {
	public static isVerbose(): boolean {
		return APP_CONFIG.loggerVerbose;
	}

	public static setVerbose(enabled: boolean): void {
		APP_CONFIG.loggerVerbose = enabled;
	}

	private static createLogMethod(
		colorFn: (text: string) => string,
		defaultEmoji: string,
	): LogMethod {
		const method: LogMethod = (
			message: string,
			emoji: string = defaultEmoji,
		) => {
			console.log(`${emoji} ${colorFn(message)}`);
		};

		method.verbose = (message: string, emoji: string = defaultEmoji) => {
			if (APP_CONFIG.loggerVerbose) {
				console.log(`${emoji} ${colorFn(message)}`);
			}
		};

		return method;
	}

	//* Log de sucesso
	public static success = this.createLogMethod(chalk.green.bold, "✅");

	//* Log de informação
	public static info = this.createLogMethod(chalk.blue, "ℹ️ ");

	//* Log de aviso
	public static warning = this.createLogMethod(chalk.yellow, "⚠️");

	//* Log de início de processo
	public static start = this.createLogMethod(chalk.green.bold, "🚀");

	//* Log de arquivo
	public static file = this.createLogMethod(chalk.dim, "📁");

	//* Log de erro
	public static error = (() => {
		const method: ErrorMethod = (
			message: string,
			error?: Error | unknown,
			emoji: string = "❌",
		) => {
			console.error(`${chalk.red.bold(emoji)} ${chalk.red.bold(message)}`);
			if (error) {
				console.error(error);
			}
		};

		method.verbose = (
			message: string,
			error?: Error | unknown,
			emoji: string = "❌",
		) => {
			if (APP_CONFIG.loggerVerbose) {
				console.error(`${chalk.red.bold(emoji)} ${chalk.red.bold(message)}`);
				if (error) {
					console.error(error);
				}
			}
		};

		return method;
	})();

	//* Log de estatísticas
	public static stats = (() => {
		const method: StatsMethod = (label: string, value: string | number) => {
			console.log(`   ${chalk.dim(label + ":")} ${value}`);
		};

		method.verbose = (label: string, value: string | number) => {
			if (APP_CONFIG.loggerVerbose) {
				console.log(`   ${chalk.dim(label + ":")} ${value}`);
			}
		};

		return method;
	})();

	//* Imprime uma linha separadora
	public static separator(): void {
		console.log("");
	}

	//* Imprime uma seção com título
	public static section(title: string): void {
		console.log(`\n${chalk.bold(title)}`);
	}
}
