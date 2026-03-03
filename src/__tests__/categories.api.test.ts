import { GET } from "@/app/api/categories/route";
import { withAuth } from "@/lib/api";
import Category from "@/models/Category";
import { POST } from "@/app/api/categories/route";
import { normalizeResponse } from "../test-utils/normalizeResponse";
import { PUT } from "@/app/api/categories/[id]/route";
import { DELETE } from "@/app/api/categories/[id]/route";
import { ForbiddenError } from "@/lib/errors";

jest.mock("@/lib/api", () => {
  return { withAuth: jest.fn() };
});

jest.mock("@/models/Category", () => {
  return { find: jest.fn(), create: jest.fn(), findById: jest.fn() };
});

describe("GET /api/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("returns only user's categories for USER role", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategories = [
      { name: "Work", ownerId: "user1" },
      { name: "Personal", ownerId: "user1" },
    ];
    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeCategories),
    });
    const response = await normalizeResponse(await GET());
    const data = await response.json();
    expect(Category.find).toHaveBeenCalledWith({ ownerId: "user1" });
    expect(data).toEqual(fakeCategories);
  });

  it("returns all categories for ADMIN role", async () => {
    const fakeSession = {
      user: { id: "admin1", role: "ADMIN" },
    };

    const fakeCategories = [
      { name: "Work", ownerId: "user1" },
      { name: "Personal", ownerId: "user2" },
    ];

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeCategories),
    });

    const response = await normalizeResponse(await GET());
    const data = await response.json();

    expect(Category.find).toHaveBeenCalledWith({});
    expect(data).toEqual(fakeCategories);
  });

  it("returns 400 when category name is missing", async () => {
    // Arrange
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);

    const request = new Request("http://localhost/api/categories", {
      method: "POST",
      body: JSON.stringify({}), // ❌ no name
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Act
    const response = (await POST(request)) as Response;
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.message).toBe("Category name is required");

    // ❗ Very important
    expect(Category.create).not.toHaveBeenCalled();
  });

  it("returns 403 when user tries to delete a category they do not own", async () => {
    // Arrange
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      ownerId: "user2", // 👈 belongs to someone else
      deleteOne: jest.fn(),
    };

    (withAuth as jest.Mock).mockRejectedValue(new ForbiddenError("Forbidden"));
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);

    const request = new Request("http://localhost/api/categories/cat1", {
      method: "DELETE",
    });

    // Act
    const response = (await DELETE(request, {
      params: { id: "cat1" },
    })) as Response;

    const data = await response.json();

    // Assert
    expect(response.status).toBe(403);
    expect(data.message).toBe("Forbidden");

    // ❗ Absolutely critical
    expect(fakeCategory.deleteOne).not.toHaveBeenCalled();
  });

  // it("returns 401 when the user is not authenticated", async () => {
  //   (withAuth as jest.Mock).mockRejectedValue(new Error("Unauthorized"));
  //   const request = new Request("http://localhost/api/categories", {
  //     method: "POST",
  //     body: JSON.stringify({ name: "Work" }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });
  //   const response = (await POST(request)) as Response;
  //   const data = await response.json();

  //   expect(response.status).toBe(401);
  //   expect(response.message).toBe("Unauthorized");
  //   expect(Category.create).not.toHaveBeenCalled();
  // });

  it("updates category when user is the owner", async () => {
    // Arrange
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      name: "Old Name",
      ownerId: "user1",
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);

    const request = new Request("http://localhost/api/categories/cat1", {
      method: "PUT",
      body: JSON.stringify({ name: "New Name" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Act
    const response = (await PUT(request, {
      params: { id: "cat1" },
    })) as Response;

    const data = await response.json();

    // Assert
    expect(Category.findById).toHaveBeenCalledWith("cat1");

    expect(fakeCategory.name).toBe("New Name");
    expect(fakeCategory.save).toHaveBeenCalled();

    expect(data).toEqual({
      _id: "cat1",
      name: "New Name",
      ownerId: "user1",
    });
  });
  it("returns 403 when user is not the owner", async () => {
    // Arrange
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      name: "Original Name",
      ownerId: "user2", // 👈 someone else owns it
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockRejectedValue(new ForbiddenError("Forbidden"));
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);

    const request = new Request("http://localhost/api/categories/cat1", {
      method: "PUT",
      body: JSON.stringify({ name: "Hacked Name" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Act
    const response = (await PUT(request, {
      params: { id: "cat1" },
    })) as Response;

    const data = await response.json();

    // Assert
    expect(response.status).toBe(403);
    expect(data.message).toBe("Forbidden");

    // ❗ Must NOT modify or save
    expect(fakeCategory.name).toBe("Original Name");
    expect(fakeCategory.save).not.toHaveBeenCalled();
  });

  it("deletes category when user is the owner", async () => {
    // Arrange
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      ownerId: "user1",
      deleteOne: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);

    const request = new Request("http://localhost/api/categories/cat1", {
      method: "DELETE",
    });

    // Act
    const response = (await DELETE(request, {
      params: { id: "cat1" },
    })) as Response;

    const data = await response.json();

    // Assert
    expect(Category.findById).toHaveBeenCalledWith("cat1");
    expect(fakeCategory.deleteOne).toHaveBeenCalled();

    expect(response.status).toBe(200);
    expect(data.message).toBe("Category deleted");
  });
});

// describe("POST /api/categories", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   it("creates a category for authenticated user", async () => {
//     const fakeSession = {
//       user: { id: "user1", role: "USER" },
//     };
//     const fakeRequestBody = {
//       name: "Work",
//     };

//     const fakeCreatedCategory = {
//       _id: "cat1",
//       name: "Work",
//       ownerId: "user1",
//     };

//     (withAuth as jest.Mock).mockResolvedValue(fakeSession);
//     (Category.find as jest.Mock).mockReturnValue({
//       sort: jest.fn().mockReturnValue(fakeCreatedCategory),
//     });
//     const request = new Request("http://localhost/api/categories", {
//       method: "POST",
//       body: JSON.stringify(fakeRequestBody),
//       headers: { "Content-Type": "application/json" },
//     });

//     const response = await normalizeResponse(POST(request));
//     const data = await response.json();

//     expect(Category.create).toHaveBeenCalledWith({
//       name: "Work",
//       ownerId: "user1",
//     });
//     expect(data).toEqual(fakeCreatedCategory);
//   });
// });
