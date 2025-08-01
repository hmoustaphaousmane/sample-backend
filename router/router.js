const express = require("express");

const router = express.Router();

const todoController = require("../controller/toDoController");
const checkIfLoggedIn = require("../middleware/checkIfLoggedIn");
const roleBasedAccess = require("../middleware/reoleBasedAccess");

router.use(checkIfLoggedIn);

// Todo Router
router.get("/:page/:limit", todoController.getAllTodo);
router.post("/todo", roleBasedAccess(["admin"]), todoController.addNewTodo);
router.post("/todo/multiple", roleBasedAccess(["admin"]), todoController.addMultipleTodos);
router.get("/single/:id", todoController.getSingleTodo);
router.patch("/:id", todoController.updateTodoStatus);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
