export function requiredRole(
  userRole: "USER" | "ADMIN",
  allowedRoles: Array<"USER" | "ADMIN">,
) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Forbidden");
  }
}
