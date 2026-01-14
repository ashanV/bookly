import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SupportStats from '@/components/admin/support/SupportStats';

// Mock Recharts to avoid sizing issues in JSDOM
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }) => <div className="recharts-responsive-container">{children}</div>,
        AreaChart: () => <div data-testid="area-chart">Area Chart</div>,
        Area: () => null,
        XAxis: () => null,
        YAxis: () => null,
        CartesianGrid: () => null,
        Tooltip: () => null,
        BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
        Bar: () => null,
        PieChart: () => null,
        Pie: () => null,
        Cell: () => null
    };
});

// Mock useCsrf
vi.mock('@/hooks/useCsrf', () => ({
    useCsrf: () => ({
        secureFetch: vi.fn(),
    }),
}));

global.fetch = vi.fn();

describe('SupportStats Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        // Mock pending fetch
        fetch.mockReturnValue(new Promise(() => { }));
        const { container } = render(<SupportStats />);
        expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders stats and charts after data fetch', async () => {
        const mockData = {
            summary: {
                totalOpen: 10,
                newToday: 5,
                unassigned: 2
            },
            ticketsOverTime: [{ date: '2024-01-01', count: 5 }],
            categoryDistribution: [{ name: 'bug', value: 3 }]
        };

        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockData
        });

        render(<SupportStats />);

        // Wait for stats content with increased timeout
        await waitFor(() => {
            expect(screen.getByText('Nowe dzisiaj')).toBeInTheDocument();
        }, { timeout: 5000 });

        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('Wszystkie otwarte')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('Nieprzypisane')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Check for charts
        expect(screen.getByTestId('area-chart')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        fetch.mockRejectedValue(new Error('API Error'));

        render(<SupportStats />);

        await waitFor(() => {
            // Should stop loading (empty render if stat is null)
            const loading = document.querySelector('.animate-pulse');
            expect(loading).not.toBeInTheDocument();
        }, { timeout: 3000 });

        consoleSpy.mockRestore();
    });
});
