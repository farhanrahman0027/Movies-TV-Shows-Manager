"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Button from "../components/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/Dialog"
import MovieForm from "../components/MovieForm"
import MovieTable from "../components/MovieTable"
import DeleteConfirmDialog from "../components/DeleteConfirmDialog"
import { Film, Tv, TrendingUp, Clock, Search, Grid, List } from "lucide-react"

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

export default function HomePage() {
  const navigate = useNavigate()
  const { logout, token, user } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"All" | "Movie" | "TV Show">("All")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Fetch movies with pagination
 const fetchMovies = useCallback(
  async (pageNum: number) => {
    if (isLoading) return; // Prevent concurrent requests
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/movies?page=${pageNum}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch movies')
      }

      const data = await response.json()

      if (pageNum === 1) {
        setMovies(data.movies)
      } else {
        setMovies((prev) => [...prev, ...data.movies])
      }

      setHasMore(data.hasMore)
    } catch (error) {
      console.error("Failed to fetch movies:", error)
      setHasMore(false) // Stop infinite scroll on error
    } finally {
      setIsLoading(false)
    }
  },
  [token, isLoading], // Changed this line - added isLoading
)
  // Initial load
  useEffect(() => {
    fetchMovies(1)
  }, [fetchMovies])

  // Filter and search
  useEffect(() => {
    let filtered = movies

    // Filter by type
    if (filterType !== "All") {
      filtered = filtered.filter((movie) => movie.type === filterType)
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredMovies(filtered)
  }, [movies, filterType, searchQuery])

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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  // Statistics
  const stats = {
    total: movies.length,
    movies: movies.filter((m) => m.type === "Movie").length,
    tvShows: movies.filter((m) => m.type === "TV Show").length,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">My Collection</h1>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
              >
                + Add Entry
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Movies</p>
                <p className="text-3xl font-bold text-slate-800">{stats.movies}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-lg">
                <Film className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">TV Shows</p>
                <p className="text-3xl font-bold text-slate-800">{stats.tvShows}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-lg">
                <Tv className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, director, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setFilterType("All")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === "All"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("Movie")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === "Movie"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => setFilterType("TV Show")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === "TV Show"
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                TV Shows
              </button>
            </div>

            <div className="flex gap-2 border-l border-slate-200 pl-4">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredMovies.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No entries found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterType !== "All"
                ? "Try adjusting your search or filters"
                : "Start by adding your first movie or TV show"}
            </p>
            {!searchQuery && filterType === "All" && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                + Add Your First Entry
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition-all group"
              >
                <div className="aspect-[2/3] bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                  {movie.poster_url ? (
                    <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {movie.type === "Movie" ? (
                        <Film className="w-16 h-16 text-white/50" />
                      ) : (
                        <Tv className="w-16 h-16 text-white/50" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        movie.type === "Movie"
                          ? "bg-indigo-500/90 text-white"
                          : "bg-pink-500/90 text-white"
                      }`}
                    >
                      {movie.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1 truncate">{movie.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{movie.director}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <Clock className="w-3 h-3" />
                    <span>{movie.duration}</span>
                    <span>•</span>
                    <span>{movie.year_time}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditMovie(movie)}
                      variant="outline"
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(movie)}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <MovieTable movies={filteredMovies} onEdit={handleEditMovie} onDelete={handleDeleteClick} />
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={observerTarget} className="py-8 text-center">
          {isLoading && (
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
          {!hasMore && movies.length > 0 && (
            <p className="text-slate-500 text-sm">You've reached the end of your collection</p>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Add New Entry</DialogTitle>
            </DialogHeader>
            <MovieForm onSubmit={handleAddMovie} />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Edit Entry</DialogTitle>
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