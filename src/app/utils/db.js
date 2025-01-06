// pages/api/db.js
import mysql from "mysql2/promise";

export async function connectToDatabase() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "boss",
    password: "bosspassword0",
    database: "drive",
  });
  return connection;
}
