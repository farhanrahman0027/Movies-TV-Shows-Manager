"use client"

import type React from "react"

import { useState } from "react"
import Button from "./Button"
import Input from "./Input"
import Label from "./Label"
import { cn } from "@/lib/utils"

interface Movie {
  id?: number
  title: string
  type: "Movie" | "TV Show"
  director: string
  budget: string
  location: string
  duration: string
  year_time: string
  poster_url?: string
}

interface MovieFormProps {
  initialData?: Movie
  onSubmit: (data: Omit<Movie, "id">) => void
}

export default function MovieForm({ initialData, onSubmit }: MovieFormProps) {
  const [formData, setFormData] = useState<Omit<Movie, "id">>({
    title: initialData?.title || "",
    type: initialData?.type || "Movie",
    director: initialData?.director || "",
    budget: initialData?.budget || "",
    location: initialData?.location || "",
    duration: initialData?.duration || "",
    year_time: initialData?.year_time || "",
    poster_url: initialData?.poster_url || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-foreground">
            Title
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter title"
            required
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-foreground">
            Type
          </Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <option value="Movie">Movie</option>
            <option value="TV Show">TV Show</option>
          </select>
        </div>

        <div>
          <Label htmlFor="director" className="text-foreground">
            Director
          </Label>
          <Input
            id="director"
            name="director"
            value={formData.director}
            onChange={handleChange}
            placeholder="Enter director name"
            required
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="budget" className="text-foreground">
            Budget
          </Label>
          <Input
            id="budget"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., $160M"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="location" className="text-foreground">
            Location
          </Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., LA, Paris"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="duration" className="text-foreground">
            Duration
          </Label>
          <Input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 148 min"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="year_time" className="text-foreground">
            Year/Time
          </Label>
          <Input
            id="year_time"
            name="year_time"
            value={formData.year_time}
            onChange={handleChange}
            placeholder="e.g., 2010"
            className="bg-background border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="poster_url" className="text-foreground">
            Poster URL
          </Label>
          <Input
            id="poster_url"
            name="poster_url"
            value={formData.poster_url}
            onChange={handleChange}
            placeholder="https://..."
            className="bg-background border-border text-foreground"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
          {initialData ? "Update" : "Add"} Entry
        </Button>
      </div>
    </form>
  )
}
