import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatWidget from '@/components/chat/ChatWidget';

// Mocks
const mockSecureFetch = vi.fn();
vi.mock('@/hooks/useCsrf', () => ({
    useCsrf: () => ({ secureFetch: mockSecureFetch })
}));

const mockSocket = {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    id: 'socket-id'
};
vi.mock('@/hooks/useSocket', () => ({
    useSocket: () => ({ socket: mockSocket, isConnected: true })
}));

vi.mock('@/components/chat/ChatWidgetProvider', () => ({
    ChatWidgetProvider: ({ children }) => <div>{children}</div>
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ChatWidget Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        mockSecureFetch.mockReset();
        // Default mock implementation
        mockSecureFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ messages: [] })
        });
    });

    it('renders launcher button initially', () => {
        render(<ChatWidget />);
        // Look for the launcher button (usually has an icon like MessageSquare)
        // We can check by role since it's a button
        expect(screen.getByRole('button')).toBeInTheDocument();
        // Or check for text if available (often just icon)
    });

    it('opens chat window on click', async () => {
        render(<ChatWidget />);
        const launcher = screen.getByRole('button');
        fireEvent.click(launcher);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Napisz wiadomość...')).toBeInTheDocument();
        });
    });

    it('sends a message', async () => {
        mockSecureFetch.mockImplementation((url, options) => {
            if (url.includes('/api/chat/messages') && options?.method === 'POST') {
                return Promise.resolve({ ok: true });
            }
            if (url.includes('/api/chat/messages')) { // GET
                return Promise.resolve({ ok: true, json: async () => ({ messages: [] }) });
            }
            if (url.includes('/api/chat/conversations')) {
                return Promise.resolve({ ok: true, json: async () => ({}) });
            }
            return Promise.resolve({ ok: false });
        });

        render(<ChatWidget />);
        const launcher = screen.getByRole('button');
        fireEvent.click(launcher);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Napisz wiadomość...')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText('Napisz wiadomość...');
        fireEvent.change(input, { target: { value: 'User Hello' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(mockSecureFetch).toHaveBeenCalledWith(expect.stringContaining('/api/chat/messages'), expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('User Hello')
            }));
        });
    });
});
