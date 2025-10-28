import { z } from "zod"
import { createUser } from "@/lib/auth"

const SignupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = SignupSchema.parse(body)

    const result = await createUser(email, password)

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ✅ Set a secure HttpOnly cookie
    const response = new Response(
      JSON.stringify({
        message: "User created successfully",
        userId: result.userId,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )

    // ⚠️ Set-Cookie header needs secure attributes
    response.headers.append(
      "Set-Cookie",
      `auth_token=${result.userId}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=3600`
    )

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    console.error("Signup error:", error)

    return new Response(
      JSON.stringify({ error: "Failed to create user" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
