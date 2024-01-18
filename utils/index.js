const sendVerificationEmail = require("./sendEmail");
const createTokenUser = require("./createTokenUser");
const generateCode = require("./generateCode");
const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const createHash = require('./createHash');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');

module.exports = {
	generateCode,
	sendVerificationEmail,
	createJWT,
	isTokenValid,
	createTokenUser,
	attachCookiesToResponse,
	createHash,
	sendResetPasswordEmail,
};
