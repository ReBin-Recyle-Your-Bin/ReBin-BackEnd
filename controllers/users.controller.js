const bcryptjs = require('bcryptjs');
const userService = require("../services/users.services");
const validator = require('validator');

const User = require("../models/user.model");
const auth = require("../middlewares/auth.js");

// controller register
exports.register = (req, res, next) => { 
    const { name, email, password } = req.body;

    // input validation
    if (!name || !email || !password) {
        return res.status(400).send({
            error: true,
            message: "Invalid input. Please provide a valid name, email, and password"
        });
    }

    // email validation
    if (!validator.isEmail(email)) {
        return res.status(400).send({
            error: true,
            message: "Invalid email format",
        });
    }

    // password validation
    if (password.length < 8) {
        return res.status(400).send({
            error: true,
            message: "Password must be at least 8 characters long",
        });
    }

    const salt = bcryptjs.genSaltSync(10);
    req.body.password = bcryptjs.hashSync(password, salt);

    userService.register(req.body, (error, result) => {
        if (error) {
            return next(error);
        }
        return res.status(200).send({
            error: false,
            message: "User created",
        });
    });
};

// controller login
exports.login = (req, res, next) => {
    const { email, password } = req.body;

    userService.login({ email, password }, (error, result) => {
        if (error) {
            if (error.status === 400) {
                return res.status(400).send({
                    error: true,
                    message: "Invalid email or password."
                });
            } else {
                return res.status(500).send({
                    error: true,
                    message: "An internal server error occurred. Please try again later."
                });
            }
        }
        return res.status(200).send({
            error: false,
            message: "Success",
            data: result,
        });
    });
};

// controller user profile
exports.userProfile = (req, res, next) => {
    const { name, email, id } = req.body;

    // Validate input
    if (!name || !email || !id) {
        return res.status(400).send({
            error: true,
            message: "Missing required fields in request body"
        });
    }

    // Send Response
    return res.status(200).send({
        error: false,
        message: "User profile fetched successfully",
        profile: {
            id,
            name,
            email,
        }
    });
};


// Function to update profile
async function updateProfile(params) {
    const { id, newName, newPassword } = params;

    try {
        let updateFields = { };
        if(newName) updateFields.name = newName;
        if(newPassword) {
            const salt = bcryptjs.genSaltSync(10);
            const hashedPassword = bcryptjs.hashSync(newPassword, salt);
            updateFields.password = hashedPassword;
        }

        // Find the user by userId and update the fields
        const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });
        return updatedUser;
    } catch (error) {
        throw error;
    }
};

// controller update profile
exports.updateProfile = async (req, res, next) => {
    const { id, newName, newPassword } = req.body;

    // Validate input
    if (!id || (!newName && !newPassword)) {
        return res.status(400).send({
            error: true,
            message: "Missing required fields in request body"
        });
    }

    try {
        const updatedUser = await updateProfile({ id, newName, newPassword });
        return res.status(200).send({
            error: false,
            message: "User profile updated successfully",
            profile: updatedUser
        });
    } catch (error) {
        return next(error);
    }
};