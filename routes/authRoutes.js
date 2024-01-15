const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
res.send("<h2>Register</h2>")
});

router.post('/login', (req, res) => {
res.send("<h2>login</h2>")
});

router.delete('/logout', (req, res) => {
res.send("<h2>Register</h2>")
});

router.post('/verify-email', (req, res) => {
res.send("<h2>verify-email</h2>")
});

router.post('/reset-password', (req, res) => {
res.send("<h2>reset-password</h2>")
});

router.post('/forgot-password', (req, res) => {
res.send("<h2>forgot-password</h2>")
});



module.exports = router;