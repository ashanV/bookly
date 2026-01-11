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

    it('renders login form', () => {
        render(<AdminLoginPage />);
        expect(screen.getByText('Panel Administracyjny')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
        expect(screen.getByLabelText('PIN (6 cyfr)')).toBeInTheDocument();
    });

    it('validates pin length', () => {
        render(<AdminLoginPage />);
        const pinInput = screen.getByLabelText('PIN (6 cyfr)');
        const submitButton = screen.getByRole('button', { name: /zaloguj/i });

        fireEvent.change(pinInput, { target: { value: '123' } });
        expect(submitButton).toBeDisabled();

        fireEvent.change(pinInput, { target: { value: '123456' } });
        expect(submitButton).not.toBeDisabled();
    });

    it('handles successful login', async () => {
        mockAdminLogin.mockResolvedValue({ success: true });
        render(<AdminLoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'password' } });
        fireEvent.change(screen.getByLabelText('PIN (6 cyfr)'), { target: { value: '123456' } });

        fireEvent.click(screen.getByRole('button', { name: /zaloguj/i }));

        await waitFor(() => {
            expect(mockAdminLogin).toHaveBeenCalledWith('admin@test.com', 'password', '123456');
            expect(mockRouterPush).toHaveBeenCalledWith('/admin');
        });
    });

    it('displays error on failed login', async () => {
        mockAdminLogin.mockResolvedValue({ success: false, error: 'Błędne dane' });
        render(<AdminLoginPage />);

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'password' } });
        fireEvent.change(screen.getByLabelText('PIN (6 cyfr)'), { target: { value: '123456' } });

        fireEvent.click(screen.getByRole('button', { name: /zaloguj/i }));

        await waitFor(() => {
            expect(screen.getByText('Błędne dane')).toBeInTheDocument();
        });
    });
});
