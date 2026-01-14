import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLoginPage from '@/app/admin/login/page';

// Mocks
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockRouterPush })
}));

const mockAdminLogin = vi.fn();
const mockIsAdminAuthenticated = false;
vi.mock('@/hooks/useAdminAuth', () => ({
    useAdminAuth: () => ({
        adminLogin: mockAdminLogin,
        isAdminAuthenticated: mockIsAdminAuthenticated,
        loading: false
    })
}));

describe('AdminLoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', async () => {
        render(<AdminLoginPage />);

        await waitFor(() => {
            expect(screen.getByText(/Panel Administracyjny/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        // Use more flexible selectors
        await waitFor(() => {
            const emailInput = screen.getByLabelText(/email/i);
            const passwordInput = screen.getByLabelText(/hasło/i);
            const pinInput = screen.getByLabelText(/PIN/i);

            expect(emailInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
            expect(pinInput).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('validates pin length', async () => {
        render(<AdminLoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/PIN/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const pinInput = screen.getByLabelText(/PIN/i);
        const submitButton = screen.getByRole('button', { name: /zaloguj/i });

        fireEvent.change(pinInput, { target: { value: '123' } });

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
        }, { timeout: 1000 });

        fireEvent.change(pinInput, { target: { value: '123456' } });

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        }, { timeout: 1000 });
    });

    it('handles successful login', async () => {
        mockAdminLogin.mockResolvedValue({ success: true });
        render(<AdminLoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/hasło/i);
        const pinInput = screen.getByLabelText(/PIN/i);

        fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.change(pinInput, { target: { value: '123456' } });

        const submitButton = screen.getByRole('button', { name: /zaloguj/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockAdminLogin).toHaveBeenCalledWith('admin@test.com', 'password', '123456');
            expect(mockRouterPush).toHaveBeenCalledWith('/admin');
        }, { timeout: 3000 });
    });

    it('displays error on failed login', async () => {
        mockAdminLogin.mockResolvedValue({ success: false, error: 'Błędne dane' });
        render(<AdminLoginPage />);

        await waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        }, { timeout: 3000 });

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/hasło/i);
        const pinInput = screen.getByLabelText(/PIN/i);

        fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.change(pinInput, { target: { value: '123456' } });

        const submitButton = screen.getByRole('button', { name: /zaloguj/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Błędne dane')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
