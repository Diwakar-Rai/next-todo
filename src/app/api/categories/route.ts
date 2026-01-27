import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { withAuth } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const session = await withAuth();
    const { name } = await req.json();
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Category name is required" },
        { status: 400 },
      );
    }
    const category = await Category.create({
      name,
      ownerId: session.user.id,
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 },
      );
    }
    return error;
  }
}

export async function GET() {
  try {
    const session = await withAuth();
    const filter =
      session.user.role === "ADMIN" ? {} : { ownerId: session.user.id };
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return error;
  }
}
