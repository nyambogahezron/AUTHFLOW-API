const CustomError = require('../errors');
const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const crypto = require('crypto');


// @ Register User
// @ endpoint /api/v1/auth/register 
// @ method POST

const register = async (req, res) => {
const {email, name, password} = req.body;

//check if email already exists
const emailAlreadyExists = await User.findOne({email});
if (emailAlreadyExists) {
	throw new CustomError.BadRequestError('Email already exists !');
}
const verificationToken = crypto.randomBytes(3).toString('hex');
 console.log(verificationToken )
const user = await User.create({
	name,
	email,
	password,
	verificationToken,
});

res.status(StatusCodes.CREATED).json({
  msg: 'User Created Success! ',
});

};


const login = (req, res) => {
res.send("<h2>login</h2>")
}

const logout = (req, res) => {
res.send("<h2>Register</h2>")
}

const verifyEmail = (req, res) => {
res.send("<h2>verify-email</h2>")
}

const resetPassword = (req, res) => {
res.send("<h2>reset-password</h2>")
}
const forgotPassword = (req, res) => {
res.send("<h2>forgot-password</h2>")
};


module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
