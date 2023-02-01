const { Schema, model } = require("mongoose");

const projectSchema = new Schema({
  name: String,
  manager: { type : 'ObjectId', ref: 'user'},
  member: [{ type : 'ObjectId', ref: 'user'}],
  attachment: { type: String, default: null },
});

module.exports = model("project", projectSchema);