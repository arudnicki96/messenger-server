const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please introduce yourself!"],
    trim: true,
    unique: [true, "This username is already taken"],
  },

  email: {
    type: String,
    required: true,
    trim: true,
    unique: [true, "This email is already in use"],
    validate: [validator.isEmail, "invalid email"],
  },

  photo: String,

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 8,
    trim: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  passwordConfirm: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },
  passwordChangedAfter: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  dialogs: [
    {
      userId: { type: String },
      conversationId: { type: String },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAfter) {
    const changedTimestamp = parseInt(
      this.passwordChangedAfter.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.addConversation = function (userId, conversationId) {
  this.dialogs = [
    ...this.dialogs,
    { userId: userId, conversationId: conversationId },
  ];
};
userSchema.methods.clearAllConversations = function () {
  this.dialogs = [];
};
const User = mongoose.model("User", userSchema);

module.exports = User;
