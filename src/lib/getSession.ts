import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies()
  const userSession = cookieStore.get("user_session")?.value
  if (!userSession) {
    return null
  }
  try {
    const user = JSON.parse(userSession)
    return { user: { id: user.id, email: user.email } }
  } catch {
    return null
  }
}