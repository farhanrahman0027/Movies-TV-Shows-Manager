import mysql from "mysql2/promise"

let connection: mysql.Connection | null = null

export async function getConnection() {
  if (connection) {
    return connection
  }

  connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "movies_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  return connection
}

export async function query(sql: string, values?: any[]) {
  const conn = await getConnection()
  const [results] = await conn.execute(sql, values || [])
  return results
}
