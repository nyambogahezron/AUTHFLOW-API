const CustomError = require("../errors");
const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const crypto = require("crypto");
const asyncWrapper = require("../middleware/asyncHandler");

const {
  sendVerificationEmail,
  generateToken,
  attachCookiesToResponse,
  createTokenUser,
} = require("../utils");

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
  const { verificationToken, email } = req.body;

  if (!verificationToken || !email) {
    throw new CustomError.BadRequestError("Provide all fields");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
});

// @ Login
// @ endpoint /api/v1/auth/login
// @ method POST

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email");
  }

  const tokenUser = createTokenUser(user);
  let refreshToken = "";

  // check for existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
});

const logout = asyncWrapper(async (req, res) => {
  const { userId } = req.body;
  await Token.findOneAndDelete({ user: userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
});

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
