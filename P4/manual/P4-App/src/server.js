import express from 'express'

const app = express();
app.get("/", (req,res) =>{
    res.send("message sent");
})

app.listen(3000,() => {
    console.log("Running Server");
})