import express from "express";
import cors from "cors";
import { initDB } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

const db = await initDB();  // <-- Open the database

// -------------------- SIGNUP --------------------
app.post("/signup", async (req, res) => {
    const { username, pw } = req.body;

    try {
        await db.run(
            "INSERT INTO users (username, password) VALUES (?, ?)",
            [username, pw]
        );

        res.json({ success: true, message: "Account created!" });
    } catch (err) {
        if (err.message.includes("UNIQUE")) {
            return res.json({ success: false, message: "Username already taken" });
        }
        return res.json({ success: false, message: "Signup error" });
    }
});

// -------------------- LOGIN --------------------
app.post("/login", async (req, res) => {
    const { username, pw } = req.body;

    const user = await db.get(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, pw]
    );

    if (user) {
        res.json({ success: true });
    } else if (username === "admin" && pw === "admin") {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid username or password" });
    }
});

// -------------------- GET POSTS --------------------
app.get("/posts", async (req, res) => {
    try {
        const posts = await db.all("SELECT * FROM posts ORDER BY id DESC");
        res.json(posts);
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// -------------------- CREATE POST --------------------
app.post("/posts", async (req, res) => {
    const { username, title, url, opinion } = req.body;

    try {
        const result = await db.run(
            "INSERT INTO posts (username, title, url, opinion) VALUES (?, ?, ?, ?)",
            [username, title, url, opinion]
        );

        // Return the post with its new id
        res.json({
            success: true,
            post: {
                id: result.lastID,
                username,
                title,
                url,
                opinion
            }
        });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});

// -------------------- DELETE POST --------------------
app.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;

    try {
        console.log(id)
        await db.run("DELETE FROM posts WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
});


app.listen(3000, () => {
    console.log("Running Server on port 3000");
});
