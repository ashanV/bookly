import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        // Parallel fetch for value and TTL
        const [value, ttl] = await Promise.all([
            redis.get(key),
            redis.ttl(key)
        ]);

        return NextResponse.json({
            key,
            value,
            ttl,
            type: typeof value // rudimentary type check
        });
    } catch (error) {
        console.error('Cache detail error:', error);
        return NextResponse.json({ error: 'Failed to fetch key details' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        await redis.del(key);

        return NextResponse.json({ success: true, message: `Deleted key ${key}` });
    } catch (error) {
        console.error('Cache delete error:', error);
        return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
    }
}
