import { query } from "@/lib/db"
import { z } from "zod"

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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const validatedData = MovieSchema.parse(body)

    const result = await query(
      `UPDATE movies_shows 
       SET title = ?, type = ?, director = ?, budget = ?, location = ?, duration = ?, year_time = ?, poster_url = ?
       WHERE id = ?`,
      [
        validatedData.title,
        validatedData.type,
        validatedData.director,
        validatedData.budget || null,
        validatedData.location || null,
        validatedData.duration || null,
        validatedData.year_time || null,
        validatedData.poster_url || null,
        id,
      ],
    )

    // Fetch the updated movie
    const updatedMovie = await query("SELECT * FROM movies_shows WHERE id = ?", [id])

    if ((updatedMovie as any[]).length === 0) {
      return Response.json({ error: "Movie not found" }, { status: 404 })
    }

    return Response.json((updatedMovie as any[])[0])
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }
    console.error("PUT /api/movies/[id] error:", error)
    return Response.json({ error: "Failed to update movie" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const result = await query("DELETE FROM movies_shows WHERE id = ?", [id])

    if ((result as any).affectedRows === 0) {
      return Response.json({ error: "Movie not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/movies/[id] error:", error)
    return Response.json({ error: "Failed to delete movie" }, { status: 500 })
  }
}
