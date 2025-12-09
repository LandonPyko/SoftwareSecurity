import express from 'express'
import cors from 'cors'
import sqlite3 from 'sqlite3'
const app = express();

app.use(cors({origin:"http://localhost:5173"}));
app.use(express.json());

app.get("/login", (req,res) =>{
    res.send("message sent");
})

app.post("/login",(req,res)=>{
    res.send("Submitted login");
})

app.listen(3000,() => {
    console.log("Running Server");
})

