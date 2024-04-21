const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name"],
    maxLength: 30,
    minLength: 3,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your Email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your Password"],
    minLength: 6,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.pre("save", async function () {
  // console.log(this.isModified("password"));
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("user", userSchema);
module.exports = User;
