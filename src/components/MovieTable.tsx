"use client"

import Button from "./Button"
import { Edit2, Trash2 } from "lucide-react"

interface Movie {
  id: number
  title: string
  type: "Movie" | "TV Show"
  director: string
  budget: string
  location: string
  duration: string
  year_time: string
  poster_url?: string
}

interface MovieTableProps {
  movies: Movie[]
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
}

export default function MovieTable({ movies, onEdit, onDelete }: MovieTableProps) {
  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/60">No entries yet. Add one to get started!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="bg-card border-b border-border">
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Director</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Budget</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Duration</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Year/Time</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie, index) => (
            <tr
              key={movie.id}
              className={`border-b border-border hover:bg-card/50 transition-colors ${
                index % 2 === 0 ? "bg-background" : "bg-card/30"
              }`}
            >
              <td className="px-6 py-4 text-sm text-foreground font-medium">{movie.title}</td>
              <td className="px-6 py-4 text-sm text-foreground">
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-medium">{movie.type}</span>
              </td>
              <td className="px-6 py-4 text-sm text-foreground">{movie.director}</td>
              <td className="px-6 py-4 text-sm text-foreground">{movie.budget}</td>
              <td className="px-6 py-4 text-sm text-foreground">{movie.location}</td>
              <td className="px-6 py-4 text-sm text-foreground">{movie.duration}</td>
              <td className="px-6 py-4 text-sm text-foreground">{movie.year_time}</td>
              <td className="px-6 py-4 text-sm">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(movie)}
                    className="text-accent hover:bg-accent/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(movie)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
