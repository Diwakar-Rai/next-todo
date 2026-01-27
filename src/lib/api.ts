import { getServerSession } from "next-auth";
import { connectDB } from "./db";
import { authOptions } from "./auth";

export async function withAuth() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  await connectDB();
  return session;
}
