import { scalekit } from "@/lib/scalekit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
  if (!code) {
    return NextResponse.json({ message: "code is not found" }, { status: 400 })
  }
  const session = await scalekit.authenticateWithCode(code, redirectUri)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decoded: any = await scalekit.validateToken(session.accessToken)
  const user = await scalekit.user.getUser(decoded.sub)

  const maxAge = 30 * 24 * 60 * 60 // 30 days
  const cookieOptions = {
    httpOnly: true,
    maxAge,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  } as const

  const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)
  response.cookies.set("access_token", session.accessToken, cookieOptions)
  response.cookies.set(
    "user_session",
    JSON.stringify({ id: user.user!.id, email: user.user!.email }),
    cookieOptions
  )
  return response
}