import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const pattern = searchParams.get('pattern') || '*';

        // Use scan for safer iteration over keys, but for admin visualization we might want "all"
        // Upstash 'keys' command is fine for smaller datasets, but scan is better practice.
        // However, standard Redis `keys` is often blocked or slow. 
        // Upstash supports `keys` well enough for admin panels.

        let keys = [];
        let cursor = 0;

        // Simple implementation using `keys` command for simplicity in this admin context
        // If the dataset is huge, this should be paginated.
        keys = await redis.keys(pattern);

        return NextResponse.json({ keys });
    } catch (error) {
        console.error('Cache list error:', error);
        return NextResponse.json({ error: 'Failed to fetch cache keys' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { pattern } = body;

        if (!pattern) {
            return NextResponse.json({ error: 'Pattern is required' }, { status: 400 });
        }

        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }

        return NextResponse.json({
            success: true,
            count: keys.length,
            message: `Cleared ${keys.length} keys matching ${pattern}`
        });
    } catch (error) {
        console.error('Cache clear error:', error);
        return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 });
    }
}
