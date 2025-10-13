import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Wylogowano" });
  const cookieStore = await cookies();
   response.cookies.set("token", "",  {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}