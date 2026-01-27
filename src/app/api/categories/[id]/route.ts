import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
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
    if (!name || name.trim().length === 0) {
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

    // ! Checking the admin

    getOwenershipOrAdmin(category.ownerId.toString(), session);

    category.name = name.trim();
    await category.save();
    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    return error;
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
        {
          status: 404,
        },
      );
    }
    getOwenershipOrAdmin(category.ownerId.toString(), session);

    await category.deleteOne();
    return NextResponse.json({ message: "Category deleted" }, { status: 200 });
  } catch (error) {
    return error;
  }
}
