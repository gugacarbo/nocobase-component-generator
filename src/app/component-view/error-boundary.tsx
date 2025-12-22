import { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Erro ao carregar componente:", error, errorInfo);
		console.error({error});
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center p-8 text-center">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Erro ao carregar componente
					</h2>
					<p className="text-gray-600 mb-4">
						{this.state.error?.message || "Ocorreu um erro desconhecido"}
					</p>
					<button
						onClick={() => this.setState({ hasError: false, error: null })}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
					>
						Tentar novamente
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export { ErrorBoundary };
