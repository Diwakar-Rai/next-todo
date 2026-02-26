import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import Todo from "@/models/Todo";
import Category from "@/models/Category";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { createTodoSchema } from "@/validation/todo.schema";

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

export const GET = withErrorHandling(async () => {
  const session = await withAuth();
  const filter =
    session.user.role === "ADMIN"
      ? { deletedAt: null }
      : { ownerId: session.user.id, deletedAt: null };
  const todos = await Todo.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(todos, { status: 200 });
});
