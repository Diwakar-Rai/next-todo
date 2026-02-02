import { GET } from "@/app/api/categories/route";
import { withAuth } from "@/lib/api";
import Category from "@/models/Category";
import { POST } from "@/app/api/categories/route";
import { normalizeResponse } from "../test-utils/normalizeResponse";

jest.mock("@/lib/api", () => {
  return { withAuth: jest.fn() };
});

jest.mock("@/models/Category", () => {
  return { find: jest.fn(), create: jest.fn() };
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
      sort: jest.fn().mockReturnValue(fakeCategories),
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
      sort: jest.fn().mockReturnValue(fakeCategories),
    });

    const response = await normalizeResponse(await GET());
    const data = await response.json();

    expect(Category.find).toHaveBeenCalledWith({});
    expect(data).toEqual(fakeCategories);
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
