import { createTestServer } from "@/test/server";
import { GET } from "@/app/api/profile/route";
jest.mock("@/lib/api", () => ({
  withAuth: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  findById: jest.fn(),
}));

import { withAuth } from "@/lib/api";
import User from "@/models/User";

describe("Profile Integration", () => {
  it("GET /api/profile returns user profile", async () => {
    const fakeSession = {
      user: { id: "user123" },
    };
    const fakeUser = {
      _id: "user123",
      name: "Test User",
      email: "test@email.com",
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });
    const server = createTestServer(GET);
    const response = await server.get("/api/profile");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeUser);
  });

  it("returns profile from database", async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@email.com",
      password: "hashed",
    });

    const foundUser = await User.findById(user._id);
    expect(foundUser?.name).toBe("Test User");
  });
});
