// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { login as apiLogin } from '../api/authApi'; // Import login from API service
// import { register as apiRegister } from '../api/authApi'; // Import register later
// import { getUserProfile } from '../api/userApi'; // Or fetch profile separately

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = 'authToken'; // Key for localStorage

// Helper function to get token from local storage
const getTokenFromStorage = () => localStorage.getItem(AUTH_TOKEN_KEY);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(getTokenFromStorage());
    const [user, setUser] = useState(null); // User object { userId, email, name? }
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isLoading, setIsLoading] = useState(true);

    // --- Logout Function (define first as it might be used in useEffect) ---
    const logout = useCallback(() => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log("AuthContext: Logged out");
        // Navigation should be handled in the component calling logout if needed
    }, []);


    // --- Login Function ---
    const login = useCallback(async (email, password) => {
        try {
            const response = await apiLogin(email, password); // Call API
            const { accessToken } = response; // Expect { accessToken: "..." }

            if (!accessToken) {
                throw new Error("Login failed: No access token received.");
            }

            // Decode token to get basic user info (ensure backend includes necessary claims)
            // Claims like 'userId', 'email', 'name' should be in the JWT payload
            const decodedToken = jwtDecode(accessToken);
            const userData = {
                id: decodedToken.userId, // Or decodedToken.sub if you used that standard claim
                email: decodedToken.email,
                name: decodedToken.name || '', // Handle if name is optional in token
                role: decodedToken.role, // <-- Make sure this line is added/correct
                companyId: decodedToken.companyId // <-- Make sure this line is added/correct
            };
            setUser(userData); // This line should already be there after the object definition

            localStorage.setItem(AUTH_TOKEN_KEY, accessToken); // Store token
            setToken(accessToken);
            setUser(userData);
            setIsAuthenticated(true);
            console.log("AuthContext: Logged in", userData);
            // No need to setIsLoading(false) here, handled by useEffect or initial state

        } catch (error) {
            console.error("AuthContext Login Error:", error);
            logout(); // Clear any partial state on login failure
            // Re-throw the error so the calling component (LoginPage) can display it
            throw error;
        }
    }, [logout]); // Include logout in dependency array

    // --- Initial Load Effect ---
    useEffect(() => {
        const currentToken = getTokenFromStorage();
        if (currentToken) {
            try {
                // Decode token on initial load to set user state
                const decodedToken = jwtDecode(currentToken);
                // Optional: Check for expiry here if needed, though API calls will fail anyway if expired
                // const currentTime = Date.now() / 1000;
                // if (decodedToken.exp < currentTime) {
                //     throw new Error("Token expired");
                // }

                const userData = {
                    id: decodedToken.userId, // Or decodedToken.sub if you used that standard claim
                    email: decodedToken.email,
                    name: decodedToken.name || '', // Handle if name is optional in token
                    role: decodedToken.role, // <-- Make sure this line is added/correct
                    companyId: decodedToken.companyId // <-- Make sure this line is added/correct
                };
                setToken(currentToken);
                setUser(userData);
                setIsAuthenticated(true);
                console.log("AuthContext: Session restored", userData);

            } catch (error) {
                // If token is invalid or expired, log out
                console.error("AuthContext: Invalid token found on load.", error);
                logout();
            }
        } else {
             setIsAuthenticated(false); // Ensure state is false if no token
        }
        setIsLoading(false); // Finished initial check
    }, [logout]); // Run only once on mount (logout is stable)


    const value = { token, user, isAuthenticated, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};