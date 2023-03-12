const express = require("express");
const app = express();
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const dialogRouter = require("./routes/dialogRoutes");

app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/dialogs", dialogRouter);

module.exports = app;
