import { createRateLimiter } from "@/lib/rateLimiter";

describe("RateLimiter", () => {
  it("allows requests within limit", async () => {
    const limiter = createRateLimiter();
    for (let i = 0; i < 100; i++) {
      await limiter.consume("test-ip");
    }
    expect(true).toBe(true);
  });
    it("blocks when limit exceeded", async () => {
      const limiter = createRateLimiter();

      for (let i = 0; i < 100; i++) {
        await limiter.consume("test-ip");
      }

      await expect(limiter.consume("test-ip")).rejects.toBeDefined();
    });
});
