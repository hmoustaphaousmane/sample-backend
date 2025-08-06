const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const schema = mongoose.Schema(
  {
    userIds: {
      type: Array,
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    message: {
      type: String,
      required: true
    },
    files: {
      type: Array,
      default: [],
    },
  },
  { timesptamps: true }
);

schema.plugin(paginate);

const messagesModel = mongoose.model("messages", schema);

module.exports = messagesModel;
