import { NextResponse } from "next/server";
import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from "./errors";
import { ZodError } from "zod";
// import { log } from "./logger";
import { logger } from "./logger";

export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    const start = Date.now();
    const request: Request = args[0] as Request;
    const requestId =
      crypto.randomUUID() || Math.random().toString(36).substring(7);
    try {
      const duration = Date.now() - start;

      const response = await handler(...args);
      // log(
      //   "INFO",
      //   `${request?.method ?? "UNKNOWN"}${request?.url ?? "UNKNOWN"}`,
      //   {
      //     status: response.status,
      //     duration,
      //     requestId,
      //   },
      // );
      logger.info({
        method: request?.method ?? "UNKNOWN",
        url: request?.url ?? "UNKNOWN",
        status: response.status,
        duration,
        requestId,
      });
      return response;
    } catch (error: any) {
      const duration = Date.now() - start;
      let status = 500;
      let message = "Internal Server Error";
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
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            message: error.issues[0]?.message || "Validation Error",
          },
          { status: 400 },
        );
      }

      // log("ERROR", `${request.method} ${request.url}`, {
      //   status,
      //   duration,
      //   requestId,
      //   error: message,
      // });
      logger.error({
        method: request?.method ?? "UNKNOWN",
        url: request?.url ?? "UNKNOWN",
        status,
        duration,
        requestId,
        error: message,
      });
      return NextResponse.json(
        { message: "Internal server erorr" },
        { status: 500 },
      );
    }
  };
}
