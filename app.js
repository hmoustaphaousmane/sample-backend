const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const todoRouter = require("./router/router");
const authRouter = require("./router/userRouter");
const paystackRouter = require("./router/paystackRouter");
const uploads = require("./utility/multerConfig")
const uploadFile = require("./utility/fileUpload");

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
app.use("/paystck", paystackRouter);

app.post("/file-uploads", uploads.single("file"), async (req, res) => {
    console.log("File propreties", req.file);
    const fileDetails = await  uploadFile(req.file);
console.log("File details:", fileDetails);

    res.send({
        message: "File uploaded successfully",
        fileDetails
    });
});

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
    
})
