import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { withErrorHandling } from "@/lib/withErrorHandling";
import { withAuth } from "@/lib/api";
import User from "@/models/User";
import { changePasswordSchema } from "@/validation/profile.schema";
import { ValidationError } from "@/lib/errors";
import { withRateLimiter } from "@/lib/withRateLimiter";

export const PATCH = withRateLimiter(
  withErrorHandling(async (req: Request) => {
    const session = await withAuth();

    const body = await req.json();

    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const user = await User.findById(session.user.id);
    if (!user || !user.password) {
      throw new ValidationError("Invalid user");
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ValidationError("Current password incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return NextResponse.json(
      {
        message: "Password updated successfully",
      },
      { status: 200 },
    );
  }),
);
