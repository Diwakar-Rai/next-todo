import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import Todo from "@/models/Todo";
import Category from "@/models/Category";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { updateTodoSchema } from "@/validation/todo.schema";

export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await withAuth();
    const body = await req.json();
    const { title, description, completed, categoryId } =
      updateTodoSchema.parse(body);
    const todo = await Todo.findById(params.id);
    if (!todo || todo.deletedAt !== null) {
      return NextResponse.json({ message: "Todo not found" }, { status: 404 });
    }
    getOwenershipOrAdmin(todo.ownerId.toString(), session);
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 },
        );
      }
      getOwenershipOrAdmin(category.ownerId.toString(), session);
      todo.categoryId = categoryId;
    }
    if (title !== undefined) {
      todo.title = title.trim();
    }
    if (description !== undefined) {
      todo.description = description;
    }
    if (completed !== undefined) {
      todo.completed = completed;
    }
    await todo.save();
    return NextResponse.json(todo, { status: 200 });
  },
);

export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await withAuth();
    const todo = await Todo.findById(params.id);
    if (!todo || todo.deletedAt !== null) {
      return NextResponse.json({ message: "Todo not found!" }, { status: 404 });
    }

    getOwenershipOrAdmin(todo.ownerId.toString(), session);

    todo.deletedAt = new Date();
    await todo.save();
    return NextResponse.json({ message: "Todo deleted" }, { status: 200 });
  },
);
