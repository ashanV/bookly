import { Redis } from '@upstash/redis';

// Initialize Redis client using environment variables
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be defined in .env.local
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
