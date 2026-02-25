import { NextResponse } from "next/server";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors";

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }

      if (error instanceof ForbiddenError) {
        return NextResponse.json({ message: error.message }, { status: 403 });
      }

      if (error instanceof NotFoundError) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error instanceof ValidationError) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { message: "Internal server erorr" },
        { status: 500 },
      );
    }
  };
}
