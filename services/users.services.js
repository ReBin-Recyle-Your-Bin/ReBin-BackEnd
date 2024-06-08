const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth.js");

// function login
async function login({ email, password }, callback) {
    try {
        const user = await User.findOne({ email }); 

        if (user !== null) {
            if (bcrypt.compareSync(password, user.password)) {
                const token = auth.generateAccessToken(email);
                return callback(null, { ...user.toJSON(), token });
            } else {
                return callback({
                    status: 400, // kode status untuk kesalahan Bad Request
                    message: "Invalid email or password."
                });
            }
        } else {
            return callback({
                status: 400, // kode status untuk kesalahan Bad Request
                message: "Invalid email or password."
            });
        }
    } catch (error) {
        return callback({
            status: 500, // kode status untuk kesalahan Internal Server Error
            message: "An internal server error occurred. Please try again later."
        });
    }
}

// function register
async function register(params, callback) {
    if (params.email === undefined) {
        return callback({ message: "email required!" });
    }

    const user = new User(params);
    try {
        await user.save();
        return callback(null, user);
    } catch (error) {
        if (error.code === 11000) { // Jika terjadi kesalahan kunci ganda (duplicate key error)
            return callback({
                status: 409, // Kode status 409 untuk kesalahan Conflict
                error: true,
                message: "Email already in use. Please use a different email."
            });
        } else {
            return callback(error);
        }
    }
}


module.exports = {
    login,
    register,
}