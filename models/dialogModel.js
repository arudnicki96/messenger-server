const mongoose = require("mongoose");

const dialogSchema = new mongoose.Schema({
  user_1: { type: String, required: true },
  user_2: { type: String, required: true },
});

const Dialog = new mongoose.model("Dialog", dialogSchema);

module.exports = Dialog;
