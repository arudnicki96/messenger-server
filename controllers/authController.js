const User = require("./../models/userModel");
const catchAsync = require("./../utilis/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utilis/AppError");
const { promisify } = require("util");
const sendEmail = require("./../utilis/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const existingUserByMail = await User.findOne({ email: req.body.email });
  const existingUserByUsername = await User.findOne({
    username: req.body.username,
  });

  if (existingUserByMail) {
    res.status(400).json({
      message: "This email is already in use",
    });
  }

  if (existingUserByUsername) {
    res.status(400).json({
      message: "This username is already in use.",
    });
  }

  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    user: newUser,
  });

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  //following function comes from authentication chapter of Johnas Schmidtmann course of Node.js
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (!(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      message: "Error: Incorrect password",
    });
  }
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to grant access", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "The user changed password after generating the token. Please log in again",
        401
      )
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError("You do not have permision to perform this operation", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError("User with such an email does not exist in database", 404)
    );
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit to this url: ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: `token send to ${req.body.email}`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    return new AppError("There was an error with something, FUCK!", 500);
  }

  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  next();
});
