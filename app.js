const express = require("express");
const todoRouter = require("./router");
require("dotenv").config();

const app = express();
const PORT = 3000;

// Midleware
app.use(express.json());

app.use("/todo", todoRouter)

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
    
})
