import { getOwenershipOrAdmin } from "@/lib/guard";

describe("getOwnershipOrAdmin", () => {
  it("allows owner to proceed", () => {
    const session = {
      user: { id: "user1", role: "USER" },
    };
    expect(() => {
      getOwenershipOrAdmin("user1", session);
    }).not.toThrow();
  });

  it("allows admin to proceed", () => {
    const session = {
      user: { id: "admin1", role: "ADMIN" },
    };

    expect(() => {
      getOwenershipOrAdmin("someone-else", session);
    }).not.toThrow();
  });

  it("throws error when non-owner user tries access", () => {
    const session = {
      user: { id: "user1", role: "USER" },
    };

    expect(() => {
      getOwenershipOrAdmin("user2", session);
    }).toThrow();
  });
});
