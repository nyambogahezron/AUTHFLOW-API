

// @ Register User
// @ endpoint /api/v1/auth/register 
// @ method POST

const register = (req, res) => {
res.send("<h2>Register</h2>")
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
