const transporter = require("../utility/sendEmail")

let todo = [];

const getAllTodo = (req, res) => {
    res.send(todo);
}

const addNewTodo = (req, res) => {
    console.log(req.body);

    const id = Math.floor(Math.random() * 10000);
    console.log(typeof (id));

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

    transporter.sendMail({
        from: "sender@gmail.com",
        to: "receiver@gmail.com",
        subject: "Todo [[Created todo]]",
        html: `
            <h1>You've added a new todo: ${req.body.title}</h1>
            <div>${req.body.description}</div>
        `
    })

    res.status(201).send({
        message: "Todo added successfully",
        todo
    });
}

const getSingleTodo = (req, res) => {
    const id = req.params.id;
    console.log(id);


    let todoFound;

    for (let i = 0; i < todo.length; i++) {
        if (todo[i].id == id) {
            todoFound = todo[i];
            break;
        }
    }

    if (!todoFound) {
        res.status(404).send("Todo not found")
        return
    }

    res.send({
        message: "Todo found",
        todoFound
    });
}

const updateTodoStatus = (req, res) => {
    const id = req.params.id;
    const isDone = req.body.isDone;

    const updateTodo = [];

    for (let i = 0; i < todo.length; i++) {
        if (todo[i].id == id) {
            todo[i].isDone = isDone;
        }
        updateTodo.push(todo[i]);
    }
    todo = updateTodo;

    res.send({
        message: "Todo update successfully",
        todo
    })
}

const deleteTodo = (req, res) => {
    const id = req.params.id;
    let deletedTodo;

    const updateTodo = [];
    for (let i = 0; i < todo.length; i++) {
        if (todo[i].id != id) {
            updateTodo.push(todo[i]);
        } else {
            deletedTodo = todo[i];
        }
    }
    todo = updateTodo;

    res.send({
        message: "Todo deleted successfulle"
    })
}

module.exports = {
    addNewTodo,
    getAllTodo,
    getSingleTodo,
    updateTodoStatus,
    deleteTodo
}
