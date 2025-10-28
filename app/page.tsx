"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import MovieForm from "@/components/movie-form"
import MovieTable from "@/components/movie-table"
import DeleteConfirmDialog from "@/components/delete-confirm-dialog"

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

export default function Home() {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  // Fetch movies with pagination
  const fetchMovies = useCallback(async (pageNum: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/movies?page=${pageNum}&limit=10`)
      const data = await response.json()

      if (pageNum === 1) {
        setMovies(data.movies)
      } else {
        setMovies((prev) => [...prev, ...data.movies])
      }

      setHasMore(data.hasMore)
    } catch (error) {
      console.error("Failed to fetch movies:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchMovies(1)
  }, [fetchMovies])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading])

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(page)
    }
  }, [page, fetchMovies])

  const handleAddMovie = async (formData: Omit<Movie, "id">) => {
    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setPage(1)
        fetchMovies(1)
      }
    } catch (error) {
      console.error("Failed to add movie:", error)
    }
  }

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
    setIsEditDialogOpen(true)
  }

  const handleUpdateMovie = async (formData: Omit<Movie, "id">) => {
    if (!editingMovie) return

    try {
      const response = await fetch(`/api/movies/${editingMovie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsEditDialogOpen(false)
        setEditingMovie(null)
        setPage(1)
        fetchMovies(1)
      }
    } catch (error) {
      console.error("Failed to update movie:", error)
    }
  }

  const handleDeleteClick = (movie: Movie) => {
    setMovieToDelete(movie)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return

    try {
      const response = await fetch(`/api/movies/${movieToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDeleteConfirmOpen(false)
        setMovieToDelete(null)
        setPage(1)
        fetchMovies(1)
      }
    } catch (error) {
      console.error("Failed to delete movie:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Movies & TV Shows</h1>
            <p className="text-foreground/60">Manage your favorite movies and TV shows collection</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary-hover text-white">
              + Add Entry
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-border text-foreground hover:bg-background/80 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>

        <MovieTable movies={movies} onEdit={handleEditMovie} onDelete={handleDeleteClick} />

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="py-8 text-center">
          {isLoading && <p className="text-foreground/60">Loading more...</p>}
          {!hasMore && movies.length > 0 && <p className="text-foreground/60">No more entries to load</p>}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Entry</DialogTitle>
            </DialogHeader>
            <MovieForm onSubmit={handleAddMovie} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
            </DialogHeader>
            {editingMovie && <MovieForm initialData={editingMovie} onSubmit={handleUpdateMovie} />}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleConfirmDelete}
          movieTitle={movieToDelete?.title}
        />
      </div>
    </main>
  )
}
