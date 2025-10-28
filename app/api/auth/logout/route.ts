export async function POST() {
  const response = Response.json({ message: "Logged out successfully" }, { status: 200 })

  response.headers.set("Set-Cookie", "auth_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0")

  return response
}
