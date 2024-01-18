const sendVerificationEmail = require("./sendEmail");
const createTokenUser = require("./createTokenUser");
const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");

module.exports = {
	sendVerificationEmail,
	createJWT,
	isTokenValid,
	createTokenUser,
	attachCookiesToResponse,
};
