import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import { Redis } from '@upstash/redis';
import os from 'os';

export async function GET() {
    try {
        // Run internal checks
        const mongoStatus = await checkMongoDB();
        const redisStatus = await checkRedis();

        // Run external checks (from merged logic)
        const cloudinary = await checkCloudinary();
        const nodemailer = await checkNodemailer();
        const pusher = await checkPusher();
        const googleCalendar = await checkGoogleCalendar();

        // System Stats
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;
        const cpuLoad = os.loadavg()[0];

        const formatUptime = (seconds) => {
            const d = Math.floor(seconds / (3600 * 24));
            const h = Math.floor((seconds % (3600 * 24)) / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);

            const parts = [];
            if (d > 0) parts.push(`${d}d`);
            if (h > 0) parts.push(`${h}h`);
            if (m > 0) parts.push(`${m}m`);
            if (parts.length === 0) parts.push(`${s}s`);
            return parts.join(' ');
        };

        const systemStats = [
            {
                label: 'CPU Load',
                value: `${cpuLoad.toFixed(1)}%`,
                rawValue: cpuLoad,
                icon: 'Cpu'
            },
            {
                label: 'Pamięć (Użycie)',
                value: `${usedMemPercent.toFixed(1)}%`,
                rawValue: usedMemPercent,
                icon: 'HardDrive'
            },
            {
                label: 'App Uptime',
                value: formatUptime(process.uptime()),
                rawValue: process.uptime(),
                icon: 'Activity'
            },
            {
                label: 'System Uptime',
                value: formatUptime(os.uptime()),
                rawValue: os.uptime(),
                icon: 'Wifi'
            },
        ];

        return NextResponse.json({
            services: [
                mongoStatus,
                redisStatus,
                { name: 'API Server', status: 'healthy', latency: '0ms' }
            ],
            external: {
                cloudinary,
                nodemailer,
                pusher,
                googleCalendar
            },
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

// --- Internal Check Functions ---

async function checkMongoDB() {
    const status = { name: 'MongoDB', status: 'unhealthy', latency: 'N/A' };
    const start = Date.now();
    try {
        await connectDB();
        if (mongoose.connection.readyState === 1) {
            status.status = 'healthy';
            status.latency = `${Date.now() - start}ms`;
        }
    } catch (error) {
        console.error('Health Check - MongoDB Error:', error);
        status.status = 'error';
    }
    return status;
}

async function checkRedis() {
    const status = { name: 'Redis Cache', status: 'unhealthy', latency: 'N/A' };
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const start = Date.now();
        try {
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            const pong = await Promise.race([
                redis.ping(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ]);
            if (pong === 'PONG') {
                status.status = 'healthy';
                status.latency = `${Date.now() - start}ms`;
            }
        } catch (error) {
            status.status = 'error';
            status.latency = 'Timeout/Error';
        }
    } else {
        status.status = 'not_configured';
    }
    return status;
}

// --- External Check Functions ---

async function checkCloudinary() {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            const missing = [];
            if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
            if (!apiKey) missing.push('CLOUDINARY_API_KEY');
            if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
            return { status: 'not_configured', message: `Brak: ${missing.join(', ')}` };
        }

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
            },
            signal: AbortSignal.timeout(5000)
        });

        if (response.ok) return { status: 'healthy', message: 'Połączenie aktywne' };
        if (response.status === 401) return { status: 'error', message: 'Błąd autoryzacji: Nieprawidłowy API Key lub Secret' };
        if (response.status === 404) return { status: 'error', message: `Błąd 404: Nie znaleziono chmury "${cloudName}"` };

        return { status: 'error', message: `Błąd API Cloudinary (${response.status})` };
    } catch (error) {
        if (error.name === 'TimeoutError' || error.name === 'AbortError') return { status: 'error', message: 'Timeout: Serwer Cloudinary nie odpowiedział w ciągu 5s' };
        if (error.code === 'ENOTFOUND') return { status: 'error', message: 'Błąd DNS: Nie można połączyć się z api.cloudinary.com' };
        return { status: 'error', message: `Błąd połączenia: ${error.message}` };
    }
}

async function checkNodemailer() {
    try {
        const host = process.env.SMTP_HOST;
        const port = process.env.SMTP_PORT;
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !port || !user || !pass) {
            const missing = [];
            if (!host) missing.push('SMTP_HOST');
            if (!port) missing.push('SMTP_PORT');
            if (!user) missing.push('SMTP_USER');
            if (!pass) missing.push('SMTP_PASS');
            return { status: 'not_configured', message: `Brak: ${missing.join(', ')}` };
        }

        const nodemailer = (await import('nodemailer')).default || (await import('nodemailer'));
        const transporter = nodemailer.createTransport({
            host,
            port: parseInt(port),
            secure: parseInt(port) === 465,
            auth: { user, pass },
            connectionTimeout: 5000,
            greetingTimeout: 5000
        });

        await transporter.verify();
        return { status: 'healthy', message: 'Połączenie SMTP aktywne' };
    } catch (error) {
        let details = error.message;
        if (error.code === 'EAUTH') details = 'Błąd logowania: Nieprawidłowy użytkownik lub hasło SMTP';
        else if (error.code === 'ETIMEDOUT') details = 'Przekroczono czas oczekiwania na połączenie z serwerem SMTP';
        else if (error.code === 'ECONNREFUSED') details = `Połączenie odrzucone przez ${host} na porcie ${port}`;
        else if (error.code === 'ESOCKET') details = 'Błąd protokołu SSL/TLS - sprawdź port i ustawienie Secure';
        else if (error.code === 'ENOTFOUND') details = `Nie znaleziono hosta: ${host}`;

        return { status: 'error', message: details };
    }
}

async function checkPusher() {
    try {
        const appId = process.env.PUSHER_APP_ID;
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const secret = process.env.PUSHER_SECRET;
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!appId || !key || !secret || !cluster) {
            const missing = [];
            if (!appId) missing.push('PUSHER_APP_ID');
            if (!key) missing.push('PUSHER_KEY');
            if (!secret) missing.push('PUSHER_SECRET');
            if (!cluster) missing.push('PUSHER_CLUSTER');
            return { status: 'not_configured', message: `Brak: ${missing.join(', ')}` };
        }

        const Pusher = (await import('pusher')).default;
        const pusher = new Pusher({ appId, key, secret, cluster, useTLS: true, timeout: 5000 });

        try {
            await pusher.get({ path: '/channels', params: {} });
            return { status: 'healthy', message: 'Połączenie aktywne' };
        } catch (pusherError) {
            if (pusherError.statusCode === 401) return { status: 'error', message: '401 Unauthorized: Nieprawidłowe klucze Pusher' };
            if (pusherError.statusCode === 403) return { status: 'error', message: '403 Forbidden: Dostęp zablokowany (sprawdź Cluster)' };
            throw pusherError;
        }
    } catch (error) {
        return { status: 'error', message: `Błąd połączenia Pusher: ${error.message}` };
    }
}

async function checkGoogleCalendar() {
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            const missing = [];
            if (!clientId) missing.push('GOOGLE_CLIENT_ID');
            if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
            return { status: 'not_configured', message: `Brak: ${missing.join(', ')}` };
        }

        return { status: 'healthy', message: 'Skonfigurowane (Wymagany Refresh Token do pełnego testu)' };
    } catch (error) {
        return { status: 'error', message: `Błąd konfiguracji Google: ${error.message}` };
    }
}
