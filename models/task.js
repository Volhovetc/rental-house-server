const { Schema, model } = require("mongoose");

const schema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  text: {
    type: String,
  },
  done: {
    type: Boolean,
    default: false,
  },
  created: {
    type: String,
  },
});

module.exports = model("task", schema);
