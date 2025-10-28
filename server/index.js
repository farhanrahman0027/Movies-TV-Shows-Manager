import express from "express"
import cors from "cors"
import mysql from "mysql2/promise"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Middleware
app.use(cors())
app.use(express.json())

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "movies_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token" })
  }
}

// Auth Routes
app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address" })
  }

  try {
    const connection = await pool.getConnection()

    // Check if user exists
    const [rows] = await connection.query("SELECT id FROM users WHERE email = ?", [email])
    if (rows.length > 0) {
      connection.release()
      return res.status(400).json({ error: "This email is already registered" })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create user
    const [result] = await connection.query("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ])

    const userId = result.insertId

    // Generate token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })

    connection.release()

    res.json({
      token,
      user: { id: userId, email },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error. Please try again later." })
  }
})

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" })
  }

  try {
    const connection = await pool.getConnection()

    // Find user
    const [rows] = await connection.query("SELECT id, password FROM users WHERE email = ?", [email])

    if (rows.length === 0) {
      connection.release()
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const user = rows[0]

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      connection.release()
      return res.status(401).json({ error: "Invalid email or password" })
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" })

    connection.release()

    res.json({
      token,
      user: { id: user.id, email },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error. Please try again later." })
  }
})

// Movie Routes
app.get("/api/movies", verifyToken, async (req, res) => {
  const page = Number.parseInt(req.query.page) || 1
  const limit = Number.parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  try {
    const connection = await pool.getConnection()

    const [movies] = await connection.query(
      "SELECT * FROM movies WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [req.userId, limit, offset],
    )

    const [countResult] = await connection.query("SELECT COUNT(*) as total FROM movies WHERE user_id = ?", [req.userId])

    const total = countResult[0].total
    const hasMore = offset + limit < total

    connection.release()

    res.json({
      movies,
      hasMore,
      total,
    })
  } catch (error) {
    console.error("Fetch movies error:", error)
    res.status(500).json({ error: "Failed to fetch movies" })
  }
})

app.post("/api/movies", verifyToken, async (req, res) => {
  const { title, type, director, budget, location, duration, year_time, poster_url } = req.body

  try {
    const connection = await pool.getConnection()

    const [result] = await connection.query(
      "INSERT INTO movies (user_id, title, type, director, budget, location, duration, year_time, poster_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [req.userId, title, type, director, budget, location, duration, year_time, poster_url],
    )

    connection.release()

    res.json({
      id: result.insertId,
      title,
      type,
      director,
      budget,
      location,
      duration,
      year_time,
      poster_url,
    })
  } catch (error) {
    console.error("Create movie error:", error)
    res.status(500).json({ error: "Failed to create movie" })
  }
})

app.put("/api/movies/:id", verifyToken, async (req, res) => {
  const { id } = req.params
  const { title, type, director, budget, location, duration, year_time, poster_url } = req.body

  try {
    const connection = await pool.getConnection()

    await connection.query(
      "UPDATE movies SET title = ?, type = ?, director = ?, budget = ?, location = ?, duration = ?, year_time = ?, poster_url = ? WHERE id = ? AND user_id = ?",
      [title, type, director, budget, location, duration, year_time, poster_url, id, req.userId],
    )

    connection.release()

    res.json({
      id: Number.parseInt(id),
      title,
      type,
      director,
      budget,
      location,
      duration,
      year_time,
      poster_url,
    })
  } catch (error) {
    console.error("Update movie error:", error)
    res.status(500).json({ error: "Failed to update movie" })
  }
})

app.delete("/api/movies/:id", verifyToken, async (req, res) => {
  const { id } = req.params

  try {
    const connection = await pool.getConnection()

    await connection.query("DELETE FROM movies WHERE id = ? AND user_id = ?", [id, req.userId])

    connection.release()

    res.json({ success: true })
  } catch (error) {
    console.error("Delete movie error:", error)
    res.status(500).json({ error: "Failed to delete movie" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
