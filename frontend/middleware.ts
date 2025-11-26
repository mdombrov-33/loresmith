import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  //* Check if user has the auth token cookie
  const tokenCookie = request.cookies.get("token");

  if (tokenCookie?.value) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/discover",
    "/my-worlds",
    "/select-theme",
    "/generate/:path*",
    "/worlds/:path*",
    "/plans",
  ],
};
