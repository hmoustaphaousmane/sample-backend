const express = require("express");

const app = express();
const PORT = 3000;

let todo = [];

// Midleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send(todo);
})

// Create a todo
app.post("/todo", (req, res) => {
    console.log(req.body);
    
    const id = Math.floor(Math.random() * 10000);
    console.log(typeof(id));
    
    const title = req.body.title;
    const description = req.body.description;

    todo.push(
        {
            id,
            title,
            description,
            isDone: false
        }
    );

    res.status(201).send({
        message: "Todo added successfully",
        todo
    });
})

app.get("/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    

    let todoFound;

    for (let i = 0; i < todo.length; i++) {
        if(todo[i].id == id) {
            todoFound = todo[i];
            break;
        }
    }

    if(!todoFound) {
        res.status(404).send("Todo not found")
        return
    }
    
    res.send({
        message: "Todo found",
        todoFound
    });
})

// Update a todo
app.patch("/:id", (req, res) => {
    const id = req.params.id;
    const isDone = req.body.isDone;

    const updateTodo = [];

    for (let i = 0; i < todo.length; i++) {
        if(todo[i].id == id) {
            todo[i].isDone = isDone;
        }
        updateTodo.push(todo[i]);
    }
    todo = updateTodo;

    res.send({
        message: "Todo update successfully",
        todo
    })
})

app.delete("/:id", (req, res) => {
    const id = req.params.id;
    let deletedTodo;

    const updateTodo = [];
    for (let i = 0; i < todo.length; i++) {
        if(todo[i].id != id) {
            updateTodo.push(todo[i]);
        } else {
            deletedTodo = todo[i];
        }
    }
    todo = updateTodo;

    res.send({
        message: "Todo deleted successfulle"
    })
})

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
    
})
