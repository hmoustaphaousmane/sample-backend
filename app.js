const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const todoRouter = require("./router/router");
const authRouter = require("./router/userRouter");
const uploads = require("./utility/multerConfig")

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log("Connected to database");
})
.catch(err => {
    console.log("Ann error occured while trying to connect::::", err);
});

const app = express();
const PORT = 3000;

// Midleware
app.use(express.json());

app.use("/auth", authRouter);
app.use("/todo", todoRouter);

app.post("/file-uploads", uploads.single("file"), (req, res) => {
    console.log("File propreties", req.file);
    res.send({
        message: "File uploaded successfully"
    });
});

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
    
})
