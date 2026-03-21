import { useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = (redirectTo = '/client/auth') => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const router = useRouter();

  // Wrap logout from context, adding redirect specific to the given page
  const logout = useCallback(async (shouldRedirect = true) => {
    await context.logout();
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [context, redirectTo, router]);

  return {
    ...context,
    logout,
  };
};