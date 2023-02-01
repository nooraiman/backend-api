const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  name: String,
  detail: String,
  project: { type : 'ObjectId', ref: 'project'},
  user: { type : 'ObjectId', ref: 'user'},
});

module.exports = model("task", taskSchema);