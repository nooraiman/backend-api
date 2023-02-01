const mongoose = require("mongoose");
require('dotenv').config()
const { MONGO_URI } = process.env;

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};