const transporter = require("../utility/sendEmail");
const todoModel = require("../schema/todo");
const Joi = require("joi"); // form validation library

const getAllTodo = async (req, res) => {
  try {
    console.log("Get decoded value:", req.decoded);

    const todo = await todoModel.find();
    res.send(todo);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error,
    });
  }
};

const validateTodo = (title, description) =>
  Joi
    .object({
      title: Joi.string().min(4).required().messages({
        "string.min": "Titile must be be at least 4 caracters long.",
      }),
      description: Joi.string().min(25).required().messages({
        "string.min": "Description must be be at least 25 caracters long.",
      }),
    })
    .min(1)
    .required()
    .validate({ title, description });

const addNewTodo = async (req, res) => {
  console.log(req.body);

  const title = req.body.title;
  const description = req.body.description;

  const { error } = Joi
    .object({
      title: Joi.string().min(4).required().messages({
        "string.min": "Titile must be be at least 4 caracters long.",
      }),
      description: Joi.string().min(25).required().messages({
        "string.min": "Description must be be at least 25 caracters long.",
      }),
    })
    .min(1)
    .required()
    .validate({ title, description });

  if (error) {
    console.log("An error occured");
    res.status(400).send({
      errorMessage: error.message,
    });
    return;
  }

  const newTodo = await todoModel.create({
    title,
    description,
    userId: req.decoded.userId,
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

const addMultipleTodos = async (req, res) => {
  const { todos } = req.body;
  // console.log(todos);

  const { error } = Joi
    .object({
      todos: Joi
        .array()
        .items({
          title: Joi.string().required(),
          description: Joi.string().required(),
        })
        .min(2)
        .required()
        .messages({
          "array.min": "Todo array must contain at leat 2 todos",
        }),
    })
    .validate({ todos });

  // const { error } = Joi.array({
  //   title: Joi.string().required(),
  //   description: Joi.string().required(),
  // })
  //   .min(1)
  //   .required()
  //   .valid(todos);

  if (error) {
    console.log("An error occured");
    res.status(400).send({
      errorMessage: error.message,
    });
    return;
  }

  const todosWithUser = todos.map((todo) => {
    todo.userId = req.decoded.userId;
    return todo;
  });

  const newTodos = await todoModel.create(todosWithUser);

  if (!newTodos) {
    res.send({
      message: "no todo created",
    });
  }

  res.status(201).send({
    message: "Todos created",
    newTodos,
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

  const schema = Joi
    .string()
    .valid("pending", "ongoing", "completed")
    .required()
    .messages({
      "any.only": "isDone can only be one of: 'pending', 'ongoing, or 'completed'",
    }); // costomized error messages

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

// Popular libraries for form validations: Joi, zod, yup

const deleteTodo = async (req, res) => {
  const id = req.params.id;
  let todo = await todoModel.findById(id);

  if (todo.userId != req.decoded.userId) {
    res.status(401).send({
      message: "This action is forbidden.",
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
  addMultipleTodos,
  getAllTodo,
  getSingleTodo,
  updateTodoStatus,
  deleteTodo,
};
