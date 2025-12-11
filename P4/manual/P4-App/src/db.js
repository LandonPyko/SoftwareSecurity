// db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Create and open the database
export async function initDB() {
    const db = await open({
        filename: "users.db",
        driver: sqlite3.Database
    });

    // Make the users table if not exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );
    `);

    // Make the posts table if not exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            opinion TEXT NOT NULL
        );
    `);


    return db;
}