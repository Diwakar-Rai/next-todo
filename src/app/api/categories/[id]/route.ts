import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { withAuth } from "@/lib/api";
import { getOwenershipOrAdmin } from "@/lib/guard";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { updateCategorySchema } from "@/validation/category.schema";

export const PUT = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
    const session = await withAuth();
    const body = await req.json();
    const { name } = updateCategorySchema.parse(body);

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
  },
);

export const DELETE = withErrorHandling(
  async (req: Request, { params }: { params: { id: string } }) => {
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
  },
);
