import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Redis } from '@upstash/redis';
import os from 'os';

export async function GET() {
    try {
        // 1. Check MongoDB
        const mongoStatus = {
            name: 'MongoDB',
            status: 'unhealthy',
            latency: 'N/A'
        };

        const mongoStart = Date.now();
        try {
            await connectDB();
            if (mongoose.connection.readyState === 1) {
                mongoStatus.status = 'healthy';
                mongoStatus.latency = `${Date.now() - mongoStart}ms`;
            }
        } catch (error) {
            console.error('Health Check - MongoDB Error:', error);
            mongoStatus.status = 'error';
        }

        // 2. Check Redis (Upstash)
        const redisStatus = {
            name: 'Redis Cache',
            status: 'unhealthy',
            latency: 'N/A'
        };

        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            const redisStart = Date.now();
            try {
                const redis = new Redis({
                    url: process.env.UPSTASH_REDIS_REST_URL,
                    token: process.env.UPSTASH_REDIS_REST_TOKEN,
                });

                // Set a timeout for the ping to avoid hanging
                const pong = await Promise.race([
                    redis.ping(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                ]);

                if (pong === 'PONG') {
                    redisStatus.status = 'healthy';
                    redisStatus.latency = `${Date.now() - redisStart}ms`;
                }
            } catch (error) {
                console.warn('Health Check - Redis is unreachable:', error.message);
                redisStatus.status = 'error';
                redisStatus.latency = 'Timeout/Error';
            }
        } else {
            redisStatus.status = 'not_configured';
        }

        // 3. Check Pusher
        const pusherStatus = {
            name: 'Pusher (Real-time)',
            status: 'healthy',
            latency: 'N/A'
        };
        const pusherConfigured = !!(
            process.env.PUSHER_APP_ID &&
            process.env.NEXT_PUBLIC_PUSHER_KEY &&
            process.env.PUSHER_SECRET
        );
        if (!pusherConfigured) {
            pusherStatus.status = 'not_configured';
        }

        // 4. System Stats
        const systemStats = [
            { label: 'CPU Load', value: `${(os.loadavg()[0]).toFixed(1)}%`, icon: 'Cpu' },
            { label: 'Pamięć Wolna', value: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`, icon: 'HardDrive' },
            { label: 'Uptime', value: `${(os.uptime() / 3600).toFixed(1)}h`, icon: 'Activity' },
            { label: 'Platforma', value: os.platform(), icon: 'Wifi' },
        ];

        return NextResponse.json({
            services: [
                mongoStatus,
                redisStatus,
                pusherStatus,
                { name: 'API Server', status: 'healthy', latency: '0ms' }
            ],
            stats: systemStats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Health Check API Error:', error);
        return NextResponse.json(
            { error: 'Failed to perform health check' },
            { status: 500 }
        );
    }
}
