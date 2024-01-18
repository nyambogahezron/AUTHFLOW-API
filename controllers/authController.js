const CustomError = require("../errors");
const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const asyncWrapper = require("../middleware/asyncHandler");

const { sendVerificationEmail: sendVerificationEmail } = require("../utils");

// @ Register User
// @ endpoint /api/v1/auth/register
// @ method POST

const register = asyncWrapper(async (req, res) => {
  const { email, name, password } = req.body;

  //check if email already exists
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists !");
  }

  // Generate Code
  function generateSixDigitCode() {
    const randomBytes = crypto.randomBytes(3);
    const sixDigitCode = parseInt(randomBytes.toString("hex"), 16) % 1000000;
    return sixDigitCode.toString().padStart(6, "0");
  }

  const verificationToken = generateSixDigitCode();

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
  });

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res.status(StatusCodes.CREATED).json({
    msg: "User Created Success, Please check Email to verify",
  });
});

// @ Verify Email
// @ endpoint /api/v1/auth/verify-email
// @ method POST

const verifyEmail = asyncWrapper(async (req, res) => {
  const { verificationToken, email} = req.body;

  if (!verificationToken || !email) {
    throw new CustomError.BadRequestError("Provide all fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';

  await user.save();

  res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
  
});

const login = (req, res) => {
  res.send("<h2>login</h2>");
};

const logout = (req, res) => {
  res.send("<h2>Register</h2>");
};

const resetPassword = (req, res) => {
  res.send("<h2>reset-password</h2>");
};
const forgotPassword = (req, res) => {
  res.send("<h2>forgot-password</h2>");
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
