import { NextResponse } from "next/server";

export async function normalizeResponse(result: unknown): Promise<Response> {
  if (result instanceof Response) {
    return result;
  }

  if (result instanceof Error) {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }

  throw new Error("Route handler returned an unsupported value");
}
