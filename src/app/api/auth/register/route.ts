import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({
        message: "Missing fields",
        status: 400,
      });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({
        message: "Email already in use",
        status: 409,
      });
    }

    const hashedPassword = await hashPassword(password);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({
      message: "User created successfully",
      status: 201,
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error", status: 500 });
  }
}
