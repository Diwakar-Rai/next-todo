export function getOwenershipOrAdmin(ownerId: string, session: any) {
  // if (session.user.role !== "ADMIN" && ownerId !== session.user.id) {
  //   throw NextResponse.json({ message: "Forbidden" }, { status: 403 });
  // }

  if (!session?.user?.id) {
    // throw NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    throw new Error("Unauthorized");
  }

  const isAdmin = session.user.role === "ADMIN";
  const isOwner = ownerId === session.user.id;

  if (!isAdmin && !isOwner) {
    // throw NextResponse.json({ message: "Forbidden" }, { status: 403 });
    throw new Error("Forbidden");
  }
}
