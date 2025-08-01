const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

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

// plugins are like add-ons: something that enable or enhance a
// particular feature that already exists
schema.plugin(paginate); // this will allow us to paginate documents

const todoModel = mongoose.model("todos", schema);

module.exports = todoModel;