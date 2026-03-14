jest.mock("@/lib/rateLimiter", () => ({
  rateLimiter: { consume: jest.fn() },
}));

import { withRateLimiter } from "@/lib/withRateLimiter";
import { rateLimiter } from "@/lib/rateLimiter";

describe("withRateLimiter middleware", () => {
  it("allows request when under limit", async () => {
    (rateLimiter.consume as jest.Mock).mockResolvedValue(true);

    const handler = jest
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    const wrapped = withRateLimiter(handler);

    const req = new Request("http://localhost/test");
    const res = await wrapped(req);

    expect(handler).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("blocks request when limit exceeded", async () => {
    (rateLimiter.consume as jest.Mock).mockRejectedValue(
      new Error("Rate limit"),
    );

    const handler = jest.fn();

    const wrapped = withRateLimiter(handler);

    const req = new Request("http://localhost/test");
    const res = await wrapped(req);

    expect(handler).not.toHaveBeenCalled();
    expect(res.status).toBe(429);
  });
});
