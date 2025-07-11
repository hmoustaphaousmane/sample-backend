const transporter = require("../utility/sendEmail");
const todoModel = require("../schema/todo");
const joi = require("joi"); // form validation library

const getAllTodo = async (req, res) => {
  try {
    console.log("Get decoded value:", req.decoded);
    
    const todo = await todoModel.find({userId: req.decoded.userId});
    res.send(todo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error,
    });
  }
};

const addNewTodo = async (req, res) => {
  console.log(req.body);

  const title = req.body.title;
  const description = req.body.description;

  const newTodo = await todoModel.create({
    title,
    description,
    userId: req.decoded.userId
  });

  transporter.sendMail({
    from: "sender@gmail.com",
    to: "receiver@gmail.com",
    subject: "Todo [[Created todo]]",
    html: `
            <h1>You've added a new todo: ${req.body.title}</h1>
            <div>${req.body.description}</div>
        `,
  });

  res.status(201).send({
    message: "Todo added successfully",
    newTodo,
  });
};

const getSingleTodo = async (req, res) => {
  const id = req.params.id;
  console.log(id);

  const todo = await todoModel.findById(id);

  if (!todo) {
    res.status(404).send({
      message: "Not todo found",
    });
    return;
  }

  res.send({
    message: "Todo found",
    todo,
  });
};

const updateTodoStatus = async (req, res) => {
  const id = req.params.id;
  const isDone = req.body.isDone;
  //   console.log(id, isDone);

  const schema = joi
    .string()
    .valid("pending", "ongoing", "completed")
    .required()
    // .messages({
    //     "any.valid": "isDone can only table 'pending', 'ongoing, 'completed'"
    // }); // TODO: search for how to costomize error messages

  const { error } = schema.validate(isDone);

  if (error) {
    res.status(422).send({
      message: error.message,
    });
    return;
  }

  const doesTodoExist = await todoModel.findById(id);

  if (!doesTodoExist) {
    res.status(404).send("Todo does not exist");
    return;
  }

  const todo = await todoModel.findByIdAndUpdate(
    id,
    {
      todoStatus: isDone,
    },
    { new: true }
  ); // {new: true} allows to always to send the new update version

  res.send({
    message: "Todo update successfully",
    todo,
  });
};

// Popular libraries for form validations: joi, zod, yup

const deleteTodo = async (req, res) => {
  const id = req.params.id;
  let todo = await todoModel.findById(id);

  if (todo.userId != req.decoded.userId) {
    res.status(401).send({
      message: "This action is forbidden."
    });
    return;
  }

  let deletedTodo = await todoModel.findByIdAndDelete(id);

  res.send({
    message: "Todo deleted successfullY",
    deletedTodo,
  });
};

module.exports = {
  addNewTodo,
  getAllTodo,
  getSingleTodo,
  updateTodoStatus,
  deleteTodo,
};
