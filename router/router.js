const express = require("express");

const router = express.Router();

const todoController = require("../controller/toDoController")

// Todo Router
router.get("", todoController.getAllTodo)
router.post("/todo", todoController.addNewTodo)
router.get("/single/:id", todoController.getSingleTodo)
router.patch("/:id", todoController.updateTodoStatus)
router.delete("/:id", todoController.deleteTodo)

module.exports = router;
