const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, "Snippet_SecretKEY", (err, user) => {
        if (err || user == null) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

function generateAccessToken(email) {
    return jwt.sign({data: email}, "Snippet_SecretKEY", {
        expiresIn: "3d"
    });
};

module.exports = {
    authenticateToken,
    generateAccessToken,
};