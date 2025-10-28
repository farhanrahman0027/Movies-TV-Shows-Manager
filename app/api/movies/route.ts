import { query } from "@/lib/db"
import { z } from "zod"

// Validation schema
const MovieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["Movie", "TV Show"]),
  director: z.string().min(1, "Director is required"),
  budget: z.string().optional(),
  location: z.string().optional(),
  duration: z.string().optional(),
  year_time: z.string().optional(),
  poster_url: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query("SELECT COUNT(*) as count FROM movies_shows")
    const total = (countResult as any)[0].count

    // Get paginated results
    const movies = await query("SELECT * FROM movies_shows ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset])

    return Response.json({
      movies,
      hasMore: offset + limit < total,
      total,
    })
  } catch (error) {
    console.error("GET /api/movies error:", error)
    return Response.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = MovieSchema.parse(body)

    const result = await query(
      `INSERT INTO movies_shows (title, type, director, budget, location, duration, year_time, poster_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        validatedData.title,
        validatedData.type,
        validatedData.director,
        validatedData.budget || null,
        validatedData.location || null,
        validatedData.duration || null,
        validatedData.year_time || null,
        validatedData.poster_url || null,
      ],
    )

    return Response.json(result as any, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("POST /api/movies error:", error)
    return Response.json({ error: "Failed to create movie" }, { status: 500 })
  }
}
