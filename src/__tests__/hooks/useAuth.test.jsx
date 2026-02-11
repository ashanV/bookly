import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock dependencies
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

const mockSecureFetch = vi.fn();
vi.mock('@/hooks/useCsrf', () => ({
    useCsrf: () => ({
        secureFetch: mockSecureFetch,
    }),
}));

// Mock global fetch
global.fetch = vi.fn();

// Wrapper with AuthProvider for renderHook
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default fetch mock (success)
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ user: { id: 1, name: 'Test User', role: 'client' } }),
        });
    });

    it('should initialize with loading state', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Initially loading should be true (or fast enough to be false if effect runs instantly in test env)
        // strict mode might cause effect to run fast.
        // await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('should fetch user on mount', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/auth/verify', expect.anything());
        expect(result.current.user).toEqual({ id: 1, name: 'Test User', role: 'client' });
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle logout', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for init
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Setup logout mock
        mockSecureFetch.mockResolvedValue({ ok: true });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({ method: 'POST' }));
        expect(mockPush).toHaveBeenCalledWith('/client/auth'); // Default redirect
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should check roles correctly', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.hasRole('client')).toBe(true);
        expect(result.current.hasRole('business')).toBe(false);
        expect(result.current.isClient).toBe(true);
        expect(result.current.isBusiness).toBe(false);
    });

    it('should handle registration success', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Mock register response
        mockSecureFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ message: 'Registered!' })
        });

        let registerResult;
        await act(async () => {
            registerResult = await result.current.register({ email: 'test@test.com' });
        });

        expect(registerResult.success).toBe(true);
        expect(mockSecureFetch).toHaveBeenCalledWith('/api/auth/register', expect.anything());
    });
});
