import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const authCookie = request.cookies.get("auth");

  if (token || authCookie?.value === "true") {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/generate/:path*", "/worlds-hub", "/worlds/:path*", "/plans"],
};
