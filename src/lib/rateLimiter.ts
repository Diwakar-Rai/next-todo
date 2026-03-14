import { RateLimiterMemory } from "rate-limiter-flexible";

export function createRateLimiter() {
    return new RateLimiterMemory({
        points: 100,
        duration: 900
    })
}

export const rateLimiter = createRateLimiter()