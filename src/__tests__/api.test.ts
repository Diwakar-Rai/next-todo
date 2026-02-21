import { withAuth } from "@/lib/api";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/db", () => ({ connectDB: jest.fn() }));

import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
describe("withAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws UNAUTHORIZED error when session is null", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    await expect(withAuth()).rejects.toThrow("Unauthorized");
  });

  it("return session and connects DB when session exists", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER", email: "test@test.com" },
    };
    (getServerSession as jest.Mock).mockResolvedValue(fakeSession);
    (connectDB as jest.Mock).mockResolvedValue(undefined);

    const session = await withAuth();
    expect(session).toBe(fakeSession);
    expect(connectDB).toHaveBeenCalled();
  });
});
