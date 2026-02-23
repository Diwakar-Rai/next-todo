import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import Todo from "@/models/Todo";
import Category from "@/models/Category";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await withAuth();
    const { title, description, completed, categoryId } = await req.json();
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
      if (!title || title.trim() === "") {
        return NextResponse.json(
          { message: "Title cannot be empty" },
          { status: 400 },
        );
      }
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
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await withAuth();
    const todo = await Todo.findById(params.id);
    if (!todo || todo.deletedAt !== null) {
      return NextResponse.json({ message: "Todo not found!" }, { status: 404 });
    }

    getOwenershipOrAdmin(todo.ownerId.toString(), session);

    todo.deletedAt = new Date();
    await todo.save();
    return NextResponse.json({ message: "Todo deleted" }, { status: 200 });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (err.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
