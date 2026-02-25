jest.mock("@/lib/api", () => ({ withAuth: jest.fn() }));
jest.mock("@/models/Todo", () => ({
  __esModule: true,
  default: { create: jest.fn(), find: jest.fn(), findById: jest.fn() },
}));
jest.mock("@/models/Category", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

import { POST, GET } from "@/app/api/todos/route";
import { PUT, DELETE } from "@/app/api/todos/[id]/route";
import { withAuth } from "@/lib/api";
import Todo from "@/models/Todo";
import Category from "@/models/Category";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/errors";

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
    (withAuth as jest.Mock).mockRejectedValue(
      new UnauthorizedError("Unauthorized"),
    );
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

    (withAuth as jest.Mock).mockRejectedValue(new ForbiddenError("Forbidden"));
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

describe("GET /api/todos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("returns only user's todos for USER role", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };
    const fakeTodos = [
      { _id: "t1", title: "Todo 1", ownerId: "user1" },
      { _id: "t2", title: "Todo 2", ownerId: "user1" },
    ];
    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeTodos),
    });
    const response = (await GET()) as Response;
    const data = await response.json();

    expect(Todo.find).toHaveBeenCalledWith({
      ownerId: "user1",
      deletedAt: null,
    });
    expect(response.status).toBe(200);
    expect(data).toEqual(fakeTodos);
  });

  it("returns all todos for ADMIN role", async () => {
    const fakeSession = {
      user: { id: "admin1", role: "ADMIN" },
    };
    const fakeTodos = [
      { _id: "t1", title: "Todo 1", ownerId: "user1" },
      { _id: "t2", title: "Todo 2", ownerId: "user2" },
    ];

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockResolvedValue(fakeTodos),
    });
    const response = (await GET()) as Response;
    const data = await response.json();

    expect(Todo.find).toHaveBeenCalledWith({
      deletedAt: null,
    });

    expect(response.status).toBe(200);
    expect(data).toEqual(fakeTodos);
  });

  it("returns 401 when user is not authenticated", async () => {
    (withAuth as jest.Mock).mockRejectedValue(new Error("Unauthorized"));
    const response = (await GET()) as Response;
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe("Unauthorized");
    expect(Todo.find).not.toHaveBeenCalled();
  });
});

describe("PUT /api/todos/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("updates todo when user is owner", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      title: "Old",
      description: "",
      completed: false,
      ownerId: "user1",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
      body: JSON.stringify({ title: "New Title" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    const data = await response.json();

    expect(fakeTodo.title).toBe("New Title");
    expect(fakeTodo.save).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(data._id).toBe("todo1");
  });

  it("returns 403 when user is not owner", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      ownerId: "user2",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated title" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    expect(response.status).toBe(403);
    expect(fakeTodo.save).not.toHaveBeenCalled();
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated title" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    expect(response.status).toBe(404);
  });

  it("returns 400 when title is empty", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      ownerId: "user1",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
      body: JSON.stringify({ title: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    expect(response.status).toBe(400);
    expect(fakeTodo.save).not.toHaveBeenCalled();
  });

  it("returns 404 when category does not exist", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      ownerId: "user1",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);
    (Category.findById as jest.Mock).mockResolvedValue(null);

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
      body: JSON.stringify({ categoryId: "badCat" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    expect(response.status).toBe(404);
  });

  it("returns 401 when user is not authenticated", async () => {
    (withAuth as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    const request = new Request("http://localhost/api/todos/todo1", {
      method: "PUT",
    });

    const response = (await PUT(request, {
      params: { id: "todo1" },
    })) as Response;

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/todos/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("soft deletes todo when user is owner", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      ownerId: "user1",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);

    const response = (await DELETE(
      new Request("http://localhost/api/todos/todo1", {
        method: "DELETE",
      }),
      { params: { id: "todo1" } },
    )) as Response;

    const data = await response.json();

    expect(fakeTodo.deletedAt).toBeInstanceOf(Date);
    expect(fakeTodo.save).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(data.message).toBe("Todo deleted");
  });

  it("returns 403 when user is not owner", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    const fakeTodo = {
      _id: "todo1",
      ownerId: "user2",
      deletedAt: null,
      save: jest.fn(),
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(fakeTodo);

    const response = (await DELETE(
      new Request("http://localhost/api/todos/todo1", {
        method: "DELETE",
      }),
      { params: { id: "todo1" } },
    )) as Response;

    expect(response.status).toBe(403);
    expect(fakeTodo.save).not.toHaveBeenCalled();
  });

  it("returns 404 when todo does not exist", async () => {
    const fakeSession = {
      user: { id: "user1", role: "USER" },
    };

    (withAuth as jest.Mock).mockResolvedValue(fakeSession);
    (Todo.findById as jest.Mock).mockResolvedValue(null);

    const response = (await DELETE(
      new Request("http://localhost/api/todos/todo1", {
        method: "DELETE",
      }),
      { params: { id: "todo1" } },
    )) as Response;

    expect(response.status).toBe(404);
  });

  it("returns 401 when user is not authenticated", async () => {
    (withAuth as jest.Mock).mockRejectedValue(new Error("Unauthorized"));

    const response = (await DELETE(
      new Request("http://localhost/api/todos/todo1", {
        method: "DELETE",
      }),
      { params: { id: "todo1" } },
    )) as Response;

    expect(response.status).toBe(401);
    expect(Todo.findById).not.toHaveBeenCalled();
  });
});
