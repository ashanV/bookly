'use client';

import { createContext, useEffect, useState, useCallback } from 'react';
import { useCsrf } from '@/hooks/useCsrf';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { secureFetch } = useCsrf();

    // Session verification — called once when provider mounts
    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/verify', { credentials: 'include' });
            if (response.ok) {
                const { user: verifiedUser } = await response.json();
                setUser(verifiedUser);
                localStorage.setItem('user', JSON.stringify(verifiedUser));
                setIsAuthenticated(true);
                console.log('✅ Sesja zweryfikowana - użytkownik zalogowany');
                return true;
            } else {
                console.log('ℹ️ Brak aktywnej sesji - tryb gościa');
                localStorage.removeItem('user');
                setUser(null);
                setIsAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Błąd podczas odświeżania danych użytkownika:', error);
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            return false;
        }
    }, []);

    // Initialization — one request for the entire application
    useEffect(() => {
        const initAuth = async () => {
            const cachedUser = localStorage.getItem('user');
            if (cachedUser) {
                try { setUser(JSON.parse(cachedUser)); } catch { }
            }
            await refreshUser();
            setLoading(false);
        };

        initAuth();
    }, [refreshUser]);

    // Logout (without redirectTo — handled by useAuth hook)
    const logout = useCallback(async () => {
        try {
            await secureFetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (_) { }
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        console.log('👋 Wylogowano');
    }, [secureFetch]);

    // Registration
    const register = useCallback(async (userData) => {
        try {
            const response = await secureFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Błąd połączenia z serwerem' };
        }
    }, [secureFetch]);

    // Profile update
    const updateProfile = useCallback(async (newUserData) => {
        try {
            const response = await secureFetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newUserData),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Błąd aktualizacji profilu' };
        }
    }, [secureFetch]);

    // Check role
    const hasRole = useCallback((role) => {
        return user?.role === role;
    }, [user]);

    // Check permission
    const hasPermission = useCallback((permission) => {
        return user?.permissions?.includes(permission) || false;
    }, [user]);

    const value = {
        user,
        setUser,
        loading,
        isAuthenticated,
        refreshUser,
        logout,
        register,
        updateProfile,
        hasRole,
        hasPermission,
        isClient: user?.role === 'client',
        isBusiness: user?.role === 'business',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
