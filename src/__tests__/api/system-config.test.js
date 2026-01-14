import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/admin/system/config/route';
import { connectDB } from '@/lib/mongodb';
import SystemConfig from '@/app/models/SystemConfig';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
    connectDB: vi.fn()
}));

vi.mock('@/app/models/SystemConfig', () => ({
    default: {
        getConfig: vi.fn()
    }
}));

describe('System Config API (Alerts)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/admin/system/config', () => {
        it('should return announcement config when enabled', async () => {
            const mockConfig = {
                announcementEnabled: true,
                announcementText: 'System maintenance scheduled',
                announcementType: 'warning',
                maintenanceMode: false
            };

            SystemConfig.getConfig.mockResolvedValue(mockConfig);

            const response = await GET();
            const data = await response.json();

            expect(connectDB).toHaveBeenCalled();
            expect(SystemConfig.getConfig).toHaveBeenCalled();
            expect(data.announcement).toEqual({
                enabled: true,
                text: 'System maintenance scheduled',
                type: 'warning'
            });
            expect(data.maintenance).toBe(false);
        });

        it('should return announcement config when disabled', async () => {
            const mockConfig = {
                announcementEnabled: false,
                announcementText: '',
                announcementType: 'info',
                maintenanceMode: false
            };

            SystemConfig.getConfig.mockResolvedValue(mockConfig);

            const response = await GET();
            const data = await response.json();

            expect(data.announcement).toEqual({
                enabled: false,
                text: '',
                type: 'info'
            });
            expect(data.maintenance).toBe(false);
        });

        it('should return maintenance mode status', async () => {
            const mockConfig = {
                announcementEnabled: false,
                announcementText: '',
                announcementType: 'info',
                maintenanceMode: true
            };

            SystemConfig.getConfig.mockResolvedValue(mockConfig);

            const response = await GET();
            const data = await response.json();

            expect(data.maintenance).toBe(true);
        });

        it('should handle all announcement types correctly', async () => {
            const types = ['info', 'warning', 'error', 'success'];

            for (const type of types) {
                const mockConfig = {
                    announcementEnabled: true,
                    announcementText: `Test ${type} message`,
                    announcementType: type,
                    maintenanceMode: false
                };

                SystemConfig.getConfig.mockResolvedValue(mockConfig);

                const response = await GET();
                const data = await response.json();

                expect(data.announcement.type).toBe(type);
                expect(data.announcement.text).toBe(`Test ${type} message`);
            }
        });

        it('should handle database errors gracefully', async () => {
            connectDB.mockRejectedValue(new Error('Database unavailable'));

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Nie udało się pobrać konfiguracji');
        });

        it('should handle missing config gracefully', async () => {
            SystemConfig.getConfig.mockResolvedValue(null);

            const response = await GET();

            // Should still attempt but fail gracefully
            expect(response.status).toBe(500);
        });
    });
});
