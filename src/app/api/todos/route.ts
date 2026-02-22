import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import Todo from "@/models/Todo";
import Category from "@/models/Category";
export async function POST(req: Request) {
  try {
    const session = await withAuth();
    const { title, description, categoryId } = await req.json();
    if (!title || title.trim() === "") {
      return NextResponse.json(
        {
          message: "Title is required.",
        },
        { status: 400 },
      );
    }
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
      description: description || "",
      ownerId: session.user.id,
      categoryId: categoryId || null,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error: any) {
    if (error.message == "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (error.message == "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await withAuth();
    const filter =
      session.user.role === "ADMIN"
        ? { deletedAt: null }
        : { ownerId: session.user.id, deletedAt: null };
    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(todos, { status: 200 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
