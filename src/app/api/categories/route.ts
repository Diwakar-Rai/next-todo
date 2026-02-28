import { NextResponse } from "next/server";
import Category from "@/models/Category";
import { withAuth } from "@/lib/api";
import { createCategorySchema } from "@/validation/category.schema";
import { withErrorHandling } from "@/lib/withErrorHandling";

export const POST = withErrorHandling(async (req: Request) => {
  const session = await withAuth();
  const body = await req.json();
  const { name } = createCategorySchema.parse(body);
  const category = await Category.create({
    name,
    ownerId: session.user.id,
  });
  return NextResponse.json(category, { status: 201 });
});

export const GET = withErrorHandling(async () => {
  const session = await withAuth();
  const filter =
    session.user.role === "ADMIN" ? {} : { ownerId: session.user.id };
  const categories = await Category.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(categories, { status: 200 });
});
