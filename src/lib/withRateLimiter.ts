import { NextResponse } from "next/server";
import { rateLimiter } from "./rateLimiter";
import { logger } from "./logger";
export function withRateLimiter(handler: Function) {
  return async (...args: any[]) => {
    const request: Request = args[0];
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    try {
      await rateLimiter.consume(ip);
      return handler(...args);
    } catch (rateLimiterRes) {
      logger.warn({
        message: "Rate Limit Exceeded",
        ip,
      });
        
        return NextResponse.json({message: "Too many requests"}, {status: 429})
    }
  };
}
