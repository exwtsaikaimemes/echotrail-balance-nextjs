import mysql from "mysql2/promise";

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

const pool = mysql.createPool({
  host: requireEnv("DB_HOST"),
  port: parseInt(process.env.DB_PORT || "6033"),
  database: requireEnv("DB_NAME"),
  user: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  waitForConnections: true,
  connectionLimit: 5,
  charset: "utf8mb4",
});

export default pool;
