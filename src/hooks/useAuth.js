import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = (redirectTo = '/client/auth') => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Funkcja do sprawdzenia czy token jest ważny
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      // Dekoduj token (bez weryfikacji - to robimy po stronie serwera)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      // Sprawdź czy token nie wygasł
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }, []);

  // Funkcja wylogowania
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    console.log('👋 Wylogowano');
    router.push(redirectTo);
  }, [router, redirectTo]);

  // Funkcja odświeżania danych użytkownika
  const refreshUser = useCallback(async () => {
  const token = localStorage.getItem('token');
  
  if (!token || !isTokenValid(token)) {
    logout();
    return false;
  }

  try {
    const response = await fetch('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      
      // ZAPISZ WSZYSTKIE DANE UŻYTKOWNIKA
      const fullUserData = {
        id: userData.user.id,
        email: userData.user.email,
        firstName: userData.user.firstName,
        lastName: userData.user.lastName,
        fullName: userData.user.fullName,
        // Dodaj inne pola jeśli są dostępne
      };
      
      setUser(fullUserData);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      setIsAuthenticated(true);
      console.log('✅ Token zweryfikowany - użytkownik zalogowany');
      return true;
    } else {
      console.log('❌ Token nieważny - wylogowanie');
      logout();
      return false;
    }
  } catch (error) {
    console.error('Błąd podczas odświeżania danych użytkownika:', error);
    logout();
    return false;
  }
}, [isTokenValid, logout]);

  // Inicjalizacja stanu autoryzacji
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData && isTokenValid(token)) {
        console.log('🔍 Znaleziono token - weryfikacja po stronie serwera...');
        
        // WAŻNE: Sprawdź token po stronie serwera
        const isValid = await refreshUser();
        
        if (!isValid) {
          // Token jest nieważny - wyczyść dane i przekieruj
          if (window.location.pathname.startsWith('/client') && !window.location.pathname.startsWith('/client/auth')) {
            router.push(redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname));
          }
        }
      } else {
        // Wyczyść nieprawidłowe dane
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('❌ Brak ważnego tokenu - wylogowanie');
        
        // Przekieruj tylko jeśli jesteśmy na chronionej stronie
        if (window.location.pathname.startsWith('/client') && !window.location.pathname.startsWith('/client/auth')) {
          router.push(redirectTo + '?redirect=' + encodeURIComponent(window.location.pathname));
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [router, redirectTo, isTokenValid, refreshUser]);

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
      };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(fullUserData));
      
      // Zaktualizuj stan
      setUser(fullUserData);
      setIsAuthenticated(true);

      console.log('✅ Logowanie udane - token zapisany');
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
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token,
        },
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
    isAdmin: hasRole('admin'),
    isClient: hasRole('client'),
    isProvider: hasRole('provider'),
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