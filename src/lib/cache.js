import { Redis } from '@upstash/redis';

// Initialize Redis client (lazy initialization)
let redis = null;

const getRedis = () => {
    if (!redis) {
        // Check if Upstash credentials are available
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            console.warn('Upstash Redis credentials not configured. Caching disabled.');
            return null;
        }

        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
    return redis;
};

/**
 * Default TTL values for different cache types (in seconds)
 */
export const CACHE_TTL = {
    BUSINESS_LIST: 5 * 60,      // 5 minutes
    BUSINESS_DETAIL: 5 * 60,    // 5 minutes
    SHORT: 60,                   // 1 minute
    LONG: 30 * 60,              // 30 minutes
};

/**
 * Generate a cache key from endpoint and params
 */
export const generateCacheKey = (prefix, params = {}) => {
    const sortedParams = Object.keys(params)
        .sort()
        .filter(key => params[key]) // Remove empty values
        .map(key => `${key}:${params[key]}`)
        .join('|');

    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
};

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null
 */
export const getCache = async (key) => {
    try {
        const client = getRedis();
        if (!client) return null;

        const data = await client.get(key);
        if (data) {
            console.log(`Cache HIT: ${key}`);
            return data;
        }
        console.log(`Cache MISS: ${key}`);
        return null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

/**
 * Set cache data with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 */
export const setCache = async (key, data, ttl = CACHE_TTL.SHORT) => {
    try {
        const client = getRedis();
        if (!client) return;

        await client.setex(key, ttl, data);
        console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
        console.error('Cache set error:', error);
    }
};

/**
 * Invalidate cache by key or pattern
 * @param {string} pattern - Key or pattern to invalidate
 */
export const invalidateCache = async (pattern) => {
    try {
        const client = getRedis();
        if (!client) return;

        // For Upstash, we use scan to find matching keys
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await Promise.all(keys.map(key => client.del(key)));
            console.log(`Cache INVALIDATED: ${keys.length} keys matching ${pattern}`);
        }
    } catch (error) {
        console.error('Cache invalidation error:', error);
    }
};

/**
 * Invalidate all business-related caches
 * @param {string} businessId - Optional specific business ID
 */
export const invalidateBusinessCache = async (businessId = null) => {
    if (businessId) {
        await invalidateCache(`business:${businessId}*`);
    }
    // Always invalidate the list cache when any business changes
    await invalidateCache('businesses:*');
};
