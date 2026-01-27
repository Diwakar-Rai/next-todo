import { NextResponse } from "next/server";
export function getOwenershipOrAdmin(ownerId: string, session: any) {
  if (session.user.role !== "ADMIN" && ownerId !== session.user.id) {
    throw NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
}
