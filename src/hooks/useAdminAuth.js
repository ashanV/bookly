'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCsrf } from '@/hooks/useCsrf';
import { ROLE_PERMISSIONS, canAccessSection } from '@/lib/adminPermissions';

export const useAdminAuth = (redirectTo = '/admin/login') => {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const router = useRouter();
    const { secureFetch } = useCsrf();

    // Wylogowanie z panelu admin
    const adminLogout = useCallback(async (shouldRedirect = true) => {
        try {
            await secureFetch('/api/admin/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (_) { }

        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminSession');
        setAdminUser(null);
        setIsAdminAuthenticated(false);

        if (shouldRedirect) {
            router.push(redirectTo);
        }
    }, [router, redirectTo, secureFetch]);

    // Weryfikacja sesji admin
    const verifyAdminSession = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/auth/verify', {
                credentials: 'include'
            });

            if (response.ok) {
                const { user } = await response.json();
                setAdminUser(user);
                localStorage.setItem('adminUser', JSON.stringify(user));
                setIsAdminAuthenticated(true);
                return true;
            } else {
                localStorage.removeItem('adminUser');
                sessionStorage.removeItem('adminSession');
                setAdminUser(null);
                setIsAdminAuthenticated(false);
                return false;
            }
        } catch (error) {
            console.error('Admin session verification failed:', error);
            setAdminUser(null);
            setIsAdminAuthenticated(false);
            return false;
        }
    }, []);

    // Inicjalizacja
    useEffect(() => {
        const initAdminAuth = async () => {
            // Sprawdź cached user
            const cachedUser = localStorage.getItem('adminUser');
            if (cachedUser) {
                try {
                    setAdminUser(JSON.parse(cachedUser));
                } catch { }
            }

            await verifyAdminSession();
            setLoading(false);
        };

        initAdminAuth();
    }, [verifyAdminSession]);

    // Logowanie do panelu admin
    const adminLogin = useCallback(async (email, password, pin) => {
        try {
            const response = await secureFetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, pin }),
            });

            const data = await response.json();

            if (response.ok) {
                setAdminUser(data.user);
                localStorage.setItem('adminUser', JSON.stringify(data.user));
                setIsAdminAuthenticated(true);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Błąd połączenia z serwerem' };
        }
    }, [secureFetch]);

    // Sprawdzenie roli
    const hasRole = useCallback((role) => {
        return adminUser?.adminRole === role;
    }, [adminUser]);

    // Sprawdzenie uprawnienia
    const hasPermission = useCallback((permission) => {
        if (!adminUser?.adminRole) return false;
        const permissions = ROLE_PERMISSIONS[adminUser.adminRole] || [];
        return permissions.includes(permission);
    }, [adminUser]);

    // Sprawdzenie dostępu do sekcji
    const canAccess = useCallback((section) => {
        return canAccessSection(adminUser?.adminRole, section);
    }, [adminUser]);

    // Pobierz wszystkie uprawnienia dla aktualnej roli
    const getPermissions = useCallback(() => {
        if (!adminUser?.adminRole) return [];
        return ROLE_PERMISSIONS[adminUser.adminRole] || [];
    }, [adminUser]);

    return {
        adminUser,
        loading,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        verifyAdminSession,
        hasRole,
        hasPermission,
        canAccess,
        getPermissions,
        isAdmin: hasRole('admin'),
        isModerator: hasRole('moderator'),
        isDeveloper: hasRole('developer'),
    };
};
