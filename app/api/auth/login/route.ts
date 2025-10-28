import { z } from "zod"
import { verifyUser } from "@/lib/auth"

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = LoginSchema.parse(body)

    const user = await verifyUser(email, password)

    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Set auth cookie
    const response = Response.json({ message: "Login successful", userId: user.id, email: user.email }, { status: 200 })

    response.headers.set("Set-Cookie", `auth_token=${user.id}; Path=/; HttpOnly; SameSite=Strict`)

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("Login error:", error)
    return Response.json({ error: "Failed to login" }, { status: 500 })
  }
}
