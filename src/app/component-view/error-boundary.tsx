import { Component, ReactNode } from "react";
import { Logger } from "@/common/Logger";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		Logger.error("Erro ao renderizar componente", error);
		Logger.error.verbose("Stack de componentes", errorInfo.componentStack);
		this.setState({ errorInfo });
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center p-8 text-center gap-4">
					<svg
						className="w-20 h-20 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<h2 className="text-xl font-semibold text-gray-800">
						Erro ao Renderizar Componente
					</h2>
					<div className="max-w-lg">
						<p className="text-gray-600 mb-2 font-mono text-sm bg-red-50 p-3 rounded border border-red-200">
							{this.state.error?.message || "Ocorreu um erro desconhecido"}
						</p>
						{this.state.errorInfo && (
							<details className="text-left text-xs text-gray-500 mt-4">
								<summary className="cursor-pointer hover:text-gray-700 font-medium">
									Ver stack trace
								</summary>
								<pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-48">
									{this.state.errorInfo.componentStack}
								</pre>
							</details>
						)}
					</div>
					<button
						onClick={this.handleReset}
						className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
					>
						Tentar Novamente
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export { ErrorBoundary };
