import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('sp_user');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const login = useCallback(async (email, password) => {
        const data = await apiLogin(email, password);
        localStorage.setItem('sp_token', data.token);
        localStorage.setItem('sp_user', JSON.stringify(data.user));
        setUser(data.user);
    }, []);

    const signup = useCallback(async (name, email, password) => {
        const data = await apiRegister(name, email, password);
        localStorage.setItem('sp_token', data.token);
        localStorage.setItem('sp_user', JSON.stringify(data.user));
        setUser(data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('sp_token');
        localStorage.removeItem('sp_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
