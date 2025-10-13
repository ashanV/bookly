import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = (redirectTo = '/client/auth') => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Funkcja wylogowania
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('👋 Wylogowano');
    router.push(redirectTo);
  }, [router, redirectTo]);

  // Funkcja odświeżania danych użytkownika
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
        console.log('❌ Brak ważnej sesji - wylogowanie');
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Błąd podczas odświeżania danych użytkownika:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Inicjalizacja stanu autoryzacji
  useEffect(() => {
    const initAuth = async () => {
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try { setUser(JSON.parse(cachedUser)); } catch {}
      }
      const isValid = await refreshUser();
      if (!isValid) {
        if (window.location.pathname.startsWith('/client') && !window.location.pathname.startsWith('/client/auth')) {
          router.push(redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [router, redirectTo, refreshUser]);

  // Funkcja logowania
  const login = useCallback(async (email, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Zapisz pełne dane użytkownika
      const fullUserData = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        fullName: data.user.fullName,
        role: data.user.role,
      };

      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      // Zaktualizuj stan
      setUser(fullUserData);
      setIsAuthenticated(true);

      console.log('✅ Logowanie udane - sesja ustawiona');
      return { success: true, user: fullUserData };
    } else {
      return { success: false, error: data.error };
    }
  } catch (error) {
    return { success: false, error: 'Błąd połączenia z serwerem' };
  }
}, []);

  // Funkcja rejestracji
  const register = useCallback(async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  }, []);

  // Funkcja aktualizacji profilu
  const updateProfile = useCallback(async (newUserData) => {
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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
  }, []);

  // Funkcja sprawdzania czy użytkownik ma określoną rolę
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  // Funkcja sprawdzania uprawnień
  const hasPermission = useCallback((permission) => {
    return user?.permissions?.includes(permission) || false;
  }, [user]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    hasRole,
    hasPermission,
    // Dodatkowe utility funkcje
    isClient: hasRole('client'),
    isBusiness: hasRole('business'),
  };
};

// Hook dla komponentów które wymagają autoryzacji
export const useRequireAuth = (redirectTo = '/client/auth') => {
  const auth = useAuth(redirectTo);
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      router.push(redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [auth.loading, auth.isAuthenticated, router, redirectTo]);

  return auth;
};