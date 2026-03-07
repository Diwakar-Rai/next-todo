import { GET, PUT } from "@/app/api/profile/route";
import { PATCH } from "@/app/api/profile/password/route";
import { compare } from "bcrypt";

jest.mock("@/lib/api", () => ({
  withAuth: jest.fn(),
}));

jest.mock("@/models/User", () => ({
  findById: jest.fn(),
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import { withAuth } from "@/lib/api";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { UnauthorizedError } from "@/lib/errors";

describe("GET /api/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns current user profile", async () => {
    const fakeSession = {
      user: { id: "user1" },
    };
    const fakeUser = {
      _id: "user1",
      name: "Test User",
      email: "test@email.com",
      role: "USER",
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (User.findById as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeUser),
    });
    const response = await GET();
    const data = await response.json();
    expect(User.findById).toHaveBeenCalledWith("user1");
    expect(data).toEqual(fakeUser);
    expect(response.status).toBe(200);
  });
  it("returns 401 if not authenticated", async () => {
    (withAuth as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized"),
    );

    const request = new Request("http://localhost/api/profile");

    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});

describe("PUT /api/profile", () => {
  it("updates user name", async () => {
    const fakeSession = {
      user: { id: "user1" },
    };

    const fakeUser = {
      _id: "user1",
      name: "Old Name",
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (User.findById as jest.Mock).mockResolvedValue(fakeUser);

    const request = new Request("http://localhost/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: "New Name",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PUT(request);

    const data = await response.json();

    expect(fakeUser.name).toBe("New Name");
    expect(fakeUser.save).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(data.name).toBe("New Name");
  });
  it("returns validation error for bad name", async () => {
    const fakeSession = {
      user: { id: "user1" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);

    const request = new Request("http://localhost/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        name: "",
      }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});

describe("PATCH /api/profile/password", () => {
  it("changes password successfully", async () => {
    const fakeSession = {
      user: { id: "user1" },
    };

    const fakeUser = {
      _id: "user1",
      password: "hashedOldPassword",
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (User.findById as jest.Mock).mockResolvedValue(fakeUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHash");

    const request = new Request("http://localhost/api/profile/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: "oldpass",
        newPassword: "newpass123",
      }),
    });

    const response = await PATCH(request);

    expect(fakeUser.password).toBe("newHash");
    expect(fakeUser.save).toHaveBeenCalled();

    expect(response.status).toBe(200);
  });
  it("fails if current password is incorrect", async () => {
    const fakeSession = {
      user: { id: "user1" },
    };

    const fakeUser = {
      password: "hash",
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (User.findById as jest.Mock).mockResolvedValue(fakeUser);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const request = new Request("http://localhost/api/profile/password", {
      method: "PATCH",
      body: JSON.stringify({
        currentPassword: "wrong",
        newPassword: "newpass",
      }),
    });

    const response = await PATCH(request);

    expect(response.status).toBe(400);
  });
});
