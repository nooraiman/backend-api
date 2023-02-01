const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  name: String,
  detail: String,
  project: { type : 'ObjectId', ref: 'project'},
});

module.exports = model("task", taskSchema);