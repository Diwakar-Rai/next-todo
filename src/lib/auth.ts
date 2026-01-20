import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import { verifyPassword } from "./password";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing Credentials");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Invalid email or password!");
        }

        if (user.status === "BLOCKED") {
          throw new Error("Account blocked");
        }

        const isValid = verifyPassword(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.userId;
      session.user.role = token.role;
      return session;
    },
  },
};
