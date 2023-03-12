const User = require("../models/userModel");
const AppError = require("../utilis/AppError");

exports.getAllUsers = async (req, res, next) => {
  try {
    const searchQuery = req.params.searchQuery;
    const regex = new RegExp(searchQuery, "i");
    const users = await User.find({ username: { $regex: regex } });

    res.status(200).json({
      status: "success",
      users: users,
    });
  } catch (err) {
    next(new AppError("Oops, something went wrong!"));
  }
};
