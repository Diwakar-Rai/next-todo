import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import Todo from "@/models/Todo";
import Category from "@/models/Category";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { createTodoSchema } from "@/validation/todo.schema";
import { todoQuerySchema } from "@/validation/todo.query.schema";

export const POST = withErrorHandling(async (req: Request) => {
  const session = await withAuth();
  const body = await req.json();
  const { title, description, categoryId } = createTodoSchema.parse(body);

  if (categoryId) {
    const category = await Category.findById(categoryId);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }
    getOwenershipOrAdmin(category.ownerId.toString(), session);
  }

  const todo = await Todo.create({
    title: title.trim(),
    description: description,
    ownerId: session.user.id,
    categoryId: categoryId || null,
  });

  return NextResponse.json(todo, { status: 201 });
});

export const GET = withErrorHandling(async (req: Request) => {
  const session = await withAuth();
  const { searchParams } = new URL(req.url);
  const parsed = todoQuerySchema.parse(
    Object.fromEntries(searchParams.entries()),
  );

  const page = parsed.page ? Number(parsed.page) : 1;
  const limit = parsed.limit ? Number(parsed.limit) : 10;
  const skip = (page - 1) * limit;
  const filter: any = { deletedAt: null };

  if (session.user.role !== "ADMIN") {
    filter.ownerId = session.user.id;
  }

  if (parsed.completed !== undefined) {
    filter.completed = parsed.completed === "true";
  }

  if (parsed.categoryId) {
    filter.categoryId = parsed.categoryId;
  }

  const sortField = parsed.sort || "createdAt";
  const sortOrder = parsed.order === "asc" ? 1 : -1;
  const todos = await Todo.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit);

  const total = await Todo.countDocuments(filter);
  return NextResponse.json({
    data: todos,
    pagination: { page, limit, total, totalpages: Math.ceil(total / limit) },
  });
});
