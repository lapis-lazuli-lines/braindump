// client/src/contexts/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

interface AuthContextType {
	isSignedIn: boolean;
	isLoading: boolean;
	userId: string | null;
	userFullName: string | null;
	userImageUrl: string | null;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const { isSignedIn, isLoaded, userId, signOut } = useAuth();
	const { user } = useUser();

	const value = {
		isSignedIn: isSignedIn || false,
		isLoading: !isLoaded,
		userId: userId || null,
		userFullName: user?.fullName || null,
		userImageUrl: user?.imageUrl || null,
		signOut,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
