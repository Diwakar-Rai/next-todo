jest.mock("@/lib/api", () => ({ withAuth: jest.fn() }));
jest.mock("@/models/Todo", () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock("@/models/Category", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

import { POST } from "@/app/api/todos/route";
import { withAuth } from "@/lib/api";
import Todo from "@/models/Todo";
import Category from "@/models/Category";

describe("POST /api/todos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a todo when input is valid", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      ownerId: "user1",
    };
    const fakeCreatedTodo = {
      _id: "todo1",
      title: "Learn Testing",
      description: "Practice Jest",
      ownerId: "user1",
      categoryId: "cat1",
    };
    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);
    (Todo.create as jest.Mock).mockResolvedValue(fakeCreatedTodo);

    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({
        title: "Learn Testing",
        description: "Practice Jest",
        categoryId: "cat1",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = (await POST(request)) as Response;
    const data = await response.json();

    expect(Category.findById).toHaveBeenCalledWith("cat1");
    expect(Todo.create).toHaveBeenCalledWith({
      title: "Learn Testing",
      description: "Practice Jest",
      ownerId: "user1",
      categoryId: "cat1",
    });
    expect(response.status).toBe(201);
    expect(data).toEqual(fakeCreatedTodo);
  });

  it("returns 400 when title is missing", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({
        description: "Not title here",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = (await POST(request)) as Response;
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.message).toBe("Title is required.");
    expect(Todo.create).not.toHaveBeenCalled();
  });
  it("returns 401 when user is not authenticated", async () => {
    (withAuth as jest.Mock).mockRejectedValue(new Error("Unauthorized"));
    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Todo",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = (await POST(request)) as Response;
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data.message).toBe("Unauthorized");
    expect(Todo.create).not.toHaveBeenCalled();
  });

  it("returns 404 when category does not exist", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.findById as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Todo",
        categoryId: "invalidCat",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = (await POST(request)) as Response;
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.message).toBe("Category not found");

    expect(Todo.create).not.toHaveBeenCalled();
  });

  it("returns 403 when category belongs to another user", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeCategory = {
      _id: "cat1",
      ownerId: "user2",
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Category.findById as jest.Mock).mockResolvedValue(fakeCategory);

    const request = new Request("http://localhost/api/todos", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Todo",
        categoryId: "cat1",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = (await POST(request)) as Response;
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.message).toBe("Forbidden");

    expect(Todo.create).not.toHaveBeenCalled();
  });
});
