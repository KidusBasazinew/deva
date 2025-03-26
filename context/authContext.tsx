"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import checkAuth from "@/app/actions/checkAuth";

// Define the type for the user object
type User = {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
};

// Define the type for the context
type AuthContextType = {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  currentUser: User | null; // Changed from `current` to `currentUser` for consistency
  setCurrentUser: (user: User | null) => void; // Changed from `setCurrent` to `setCurrentUser`
};

// Create the context with the type
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const { isAuthenticated, user } = await checkAuth();
      setIsAuthenticated(isAuthenticated);
      setCurrentUser(user ?? null);
    };

    checkAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        currentUser, // Matches the type
        setCurrentUser, // Matches the type
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
