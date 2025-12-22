/**
 * Sistema de logging centralizado para o bundler
 */
export class Logger {
	private static readonly COLORS = {
		reset: "\x1b[0m",
		bright: "\x1b[1m",
		dim: "\x1b[2m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		cyan: "\x1b[36m",
		red: "\x1b[31m",
	};

	private static prefix(emoji: string, color: string): string {
		return `${color}${emoji}${this.COLORS.reset}`;
	}

	/**
	 * Log de sucesso
	 */
	public static success(message: string): void {
		console.log(`${this.prefix("✅", this.COLORS.green)} ${message}`);
	}

	/**
	 * Log de informação
	 */
	public static info(message: string): void {
		console.log(`${this.prefix("ℹ️", this.COLORS.blue)} ${message}`);
	}

	/**
	 * Log de aviso
	 */
	public static warning(message: string): void {
		console.log(`${this.prefix("⚠️", this.COLORS.yellow)} ${message}`);
	}

	/**
	 * Log de erro
	 */
	public static error(message: string, error?: Error): void {
		console.error(`${this.prefix("❌", this.COLORS.red)} ${message}`);
		if (error) {
			console.error(error);
		}
	}

	/**
	 * Log de início de processo
	 */
	public static start(message: string): void {
		console.log(`\n${this.prefix("🚀", this.COLORS.cyan)} ${message}\n`);
	}

	/**
	 * Log de arquivo
	 */
	public static file(message: string): void {
		console.log(`${this.prefix("📁", this.COLORS.dim)} ${message}`);
	}

	/**
	 * Log de estatísticas
	 */
	public static stats(label: string, value: string | number): void {
		console.log(
			`${this.COLORS.dim}   ${label}:${this.COLORS.reset} ${value}`
		);
	}

	/**
	 * Imprime uma linha separadora
	 */
	public static separator(): void {
		console.log("");
	}

	/**
	 * Imprime uma seção com título
	 */
	public static section(title: string): void {
		console.log(`\n${this.COLORS.bright}${title}${this.COLORS.reset}`);
	}
}
