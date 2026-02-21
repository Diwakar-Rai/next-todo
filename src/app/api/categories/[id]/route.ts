import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await withAuth();
    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 },
      );
    }

    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    getOwenershipOrAdmin(category.ownerId.toString(), session);

    category.name = name.trim();
    await category.save();

    return NextResponse.json(category, { status: 200 });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error?.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
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
    const category = await Category.findById(params.id);

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    getOwenershipOrAdmin(category.ownerId.toString(), session);

    await category.deleteOne();

    return NextResponse.json({ message: "Category deleted" }, { status: 200 });
  } catch (error: any) {
    if (error?.message === "Unauthorized") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (error?.message === "Forbidden") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
