import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { withAuth } from "@/lib/api";
import User from "@/models/User";
import { updateProfileSchema } from "@/validation/profile.schema";
import { NotFoundError } from "@/lib/errors";

export const GET = withErrorHandling(async () => {
  const session = await withAuth();
  const user = await User.findById(session.user.id).select("-password");
  return NextResponse.json(user, { status: 200 });
});

export const PUT = withErrorHandling(async (req: Request) => {
  const session = await withAuth();
  const body = await req.json();
  const { name } = updateProfileSchema.parse(body);

  const user = await User.findById(session.user.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.name = name;
  await user.save();
  return NextResponse.json(user, { status: 200 });
});
