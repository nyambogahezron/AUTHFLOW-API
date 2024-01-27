const CustomError = require("../errors");
const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const asyncWrapper = require("../middleware/asyncHandler");
const crypto = require("crypto");

const {
  generateCode,
  sendVerificationEmail,
  sendResetPasswordEmail,
  generateToken,
  attachCookiesToResponse,
  createTokenUser,
  createHash,
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

  const verificationToken = generateCode();

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
  user.password = null;

  res.status(StatusCodes.CREATED).json({
    msg: "User Created Success, Please check Email to verify",
    user: user,
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
  user.password = undefined;

  res.status(StatusCodes.OK).json({ msg: "Email Verified Successful", user: user });
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

// @ Logout
// @ endpoint /api/v1/auth/logout
// @ method DELETE

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
  res.status(StatusCodes.OK).json({ msg: "user logged out!", user: userId });
});



// @ Forgot Password
// @ endpoint /api/v1/auth/forgot-password
// @ method POST

const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = generateCode();

    // send email
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  } else {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password code" });
});

// @ Reset Password
// @ endpoint /api/v1/auth/reset-password
// @ method POST
const resetPassword = asyncWrapper(async (req, res) => {
   const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
    else {
    throw new CustomError.BadRequestError("Something went wrong Please try again");

    }
  } else {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

   res
    .status(StatusCodes.OK)
    .json({ msg: "password reset Successful" });
});
module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
