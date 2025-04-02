import React, { createContext, useContext, useState, ReactNode } from "react";

interface ErrorContextType {
	globalError: string | null;
	setGlobalError: (error: string | null) => void;
	clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [globalError, setGlobalError] = useState<string | null>(null);

	const clearError = () => setGlobalError(null);

	// Auto-clear errors after 5 seconds
	React.useEffect(() => {
		if (globalError) {
			const timer = setTimeout(() => {
				clearError();
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [globalError]);

	return <ErrorContext.Provider value={{ globalError, setGlobalError, clearError }}>{children}</ErrorContext.Provider>;
};

export const useError = () => {
	const context = useContext(ErrorContext);
	if (context === undefined) {
		throw new Error("useError must be used within an ErrorProvider");
	}
	return context;
};
