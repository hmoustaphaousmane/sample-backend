const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true
    },
    description: {
      type: String,
      require: true,
    },
    todoStatus: {
      type: String,
      enum: ["pending", "ongoing", "completed"],
      default: "pending"
    }
  },
  {
    timestamps: true,
  }
);

const todoModel = mongoose.model("todos", schema);

module.exports = todoModel;