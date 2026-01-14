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

    it('renders component without crashing', () => {
        const { container } = render(<ChatWidget />);
        expect(container).toBeTruthy();
    });

    it('displays at least one button (launcher)', () => {
        render(<ChatWidget />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('mocks are properly configured', () => {
        expect(mockSecureFetch).toBeDefined();
        expect(mockSocket).toBeDefined();
        expect(mockSocket.subscribe).toBeDefined();
    });
});
