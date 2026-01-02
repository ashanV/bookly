import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as listClients, POST as createClient } from '../app/api/clients/route';
import { GET as getClient, DELETE as deleteClient } from '../app/api/clients/[id]/route';
import Client from '../app/models/Client';
import { NextResponse } from 'next/server';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
    connectDB: vi.fn(),
}));

vi.mock('../app/models/Client', () => {
    return {
        default: {
            find: vi.fn(),
            findById: vi.fn(),
            findByIdAndDelete: vi.fn(),
        }
    };
});

// Mock NextResponse
vi.mock('next/server', () => ({
    NextResponse: {
        json: vi.fn((data, options) => ({ data, status: options?.status || 200 })),
    },
}));

describe('Client API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/clients (List)', () => {
        it('should return 400 if businessId is missing', async () => {
            const req = { url: 'http://localhost/api/clients' };
            const res = await listClients(req);
            expect(res.status).toBe(400);
            expect(res.data.error).toBe('Brak businessId');
        });

        it('should return list of clients', async () => {
            const req = { url: 'http://localhost/api/clients?businessId=123' };
            const mockClients = [
                {
                    _id: 'c1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '123456789',
                    phonePrefix: '+48',
                    createdAt: new Date(),
                    tags: [],
                    status: 'active'
                }
            ];

            // Mock chainable query: find().sort().lean()
            const mockSort = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue(mockClients) });
            Client.find.mockReturnValue({ sort: mockSort });

            const res = await listClients(req);

            expect(res.status).toBe(200);
            expect(res.data.clients).toHaveLength(1);
            expect(res.data.clients[0].firstName).toBe('John');
            expect(Client.find).toHaveBeenCalledWith(expect.objectContaining({ businessId: '123' }));
        });

        it('should apply search filter', async () => {
            const req = { url: 'http://localhost/api/clients?businessId=123&search=John' };
            const mockSort = vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) });
            Client.find.mockReturnValue({ sort: mockSort });

            await listClients(req);

            expect(Client.find).toHaveBeenCalledWith(expect.objectContaining({
                businessId: '123',
                $or: expect.any(Array)
            }));
        });
    });

    describe('POST /api/clients (Create)', () => {
        it('should return 400 if businessId is missing', async () => {
            const req = { json: async () => ({ firstName: 'John' }) };
            const res = await createClient(req);
            expect(res.status).toBe(400);
            expect(res.data.error).toBe('Brak businessId');
        });

        it('should return 400 if names are missing', async () => {
            const req = { json: async () => ({ businessId: '123' }) };
            const res = await createClient(req);
            expect(res.status).toBe(400);
            expect(res.data.error).toContain('wymagane');
        });

        it('should create a client successfully', async () => {
            const clientData = {
                businessId: '123',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com'
            };
            const req = { json: async () => clientData };

            // Note: in previous step we had issues with mocking 'new Client()' directly in the first block
            // but fixed it in the override below.
            // For cleaner code, we ensure the Client default export is a mock class here/
        });
    });
});

// Refined Mock for Client Model to support constructor
vi.mock('../app/models/Client', () => {
    const mockFind = vi.fn();
    const mockFindById = vi.fn();
    const mockFindByIdAndDelete = vi.fn();

    // Mock class
    class MockClient {
        constructor(data) {
            Object.assign(this, data);
            this._id = 'new_id';
        }
        save() {
            return Promise.resolve(this);
        }
    }

    // Attach static methods
    MockClient.find = mockFind;
    MockClient.findById = mockFindById;
    MockClient.findByIdAndDelete = mockFindByIdAndDelete;

    return { default: MockClient };
});


describe('Client API - Continued', () => {
    // Re-run POST test with correct mock
    describe('POST /api/clients (Create)', () => {
        it('should create a client successfully', async () => {
            const clientData = {
                businessId: '123',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com'
            };
            const req = { json: async () => clientData };

            const res = await createClient(req);

            expect(res.status).toBe(201);
            expect(res.data.message).toBe('Klient został dodany');
            expect(res.data.client.firstName).toBe('Jane');
        });
    });

    describe('GET /api/clients/[id]', () => {
        it('should return 400 if id is missing', async () => {
            const req = {};
            const params = { params: {} }; // Missing id
            const res = await getClient(req, params);
            expect(res.status).toBe(400);
        });

        it('should return 404 if client not found', async () => {
            Client.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(null) });
            const req = {};
            const params = { params: { id: 'missing' } };

            const res = await getClient(req, params);
            expect(res.status).toBe(404);
        });

        it('should return client data', async () => {
            const mockClient = {
                _id: 'c1',
                firstName: 'John',
                lastName: 'Doe',
                status: 'active'
            };
            Client.findById.mockReturnValue({ lean: vi.fn().mockResolvedValue(mockClient) });

            const req = {};
            const params = { params: { id: 'c1' } };

            const res = await getClient(req, params);
            expect(res.status).toBe(200);
            expect(res.data.client.id).toBe('c1');
            expect(res.data.client.firstName).toBe('John');
        });
    });

    describe('DELETE /api/clients/[id]', () => {
        it('should return 404 if client not found', async () => {
            Client.findByIdAndDelete.mockResolvedValue(null);
            const req = {};
            const params = { params: { id: 'missing' } };

            const res = await deleteClient(req, params);
            expect(res.status).toBe(404);
        });

        it('should delete client successfully', async () => {
            Client.findByIdAndDelete.mockResolvedValue({ _id: 'c1' });
            const req = {};
            const params = { params: { id: 'c1' } };

            const res = await deleteClient(req, params);
            expect(res.status).toBe(200);
            expect(res.data.message).toBe('Klient został usunięty');
        });
    });
});
