// client/src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from "react";
import Logo from "./Logo";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	static getDerivedStateFromError(error: Error) {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error to a service
		console.error("ErrorBoundary caught an error:", error, errorInfo);
		this.setState({ errorInfo });

		// Here you could send the error to a reporting service like Sentry
		// reportErrorToService(error, errorInfo);
	}

	handleReset = () => {
		this.setState({
			hasError: false,
			error: null,
			errorInfo: null,
		});
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback UI
			return (
				this.props.fallback || (
					<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
						<div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
							<div className="flex justify-center mb-6">
								<Logo size="lg" />
							</div>

							<h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Something went wrong</h2>

							<div className="bg-red-50 p-4 rounded-lg mb-4">
								<p className="text-red-700 mb-2 font-medium">{this.state.error?.name || "Error"}</p>
								<p className="text-red-600 text-sm">{this.state.error?.message || "An unknown error occurred"}</p>
							</div>

							<p className="text-gray-600 mb-6 text-center">
								The application encountered an unexpected error. You can try refreshing the page or contact support if the problem persists.
							</p>

							<div className="flex justify-center space-x-4">
								<button onClick={this.handleReset} className="px-4 py-2 bg-[#5a2783] hover:bg-[#6b2f9c] text-white rounded-full">
									Try Again
								</button>

								<button onClick={() => window.location.reload()} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full">
									Refresh Page
								</button>
							</div>
						</div>
					</div>
				)
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
