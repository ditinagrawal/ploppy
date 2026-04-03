import { NextRequest, NextResponse } from "next/server";

export default function proxy(req: NextRequest) {
  const session = req.cookies.get("user_session")?.value
  if (!session) {
    return NextResponse.redirect(new URL("/", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}