import bcrypt from "bcryptjs"
import { query } from "./db"

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password)

  try {
    const result = await query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword])
    return { success: true, userId: (result as any).insertId }
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return { success: false, error: "Email already exists" }
    }
    throw error
  }
}

export async function getUserByEmail(email: string) {
  const results = await query("SELECT * FROM users WHERE email = ?", [email])
  return (results as any[])[0] || null
}

export async function verifyUser(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return { id: user.id, email: user.email }
}
