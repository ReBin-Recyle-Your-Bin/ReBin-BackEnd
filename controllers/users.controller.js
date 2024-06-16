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
            message: "Input tidak valid. Silahkan masukkan nama, email, dan password yang valid"
        });
    }

    // email validation
    if (!validator.isEmail(email)) {
        return res.status(400).send({
            error: true,
            message: "Invalid format email",
        });
    }

    // password validation
    if (password.length < 8) {
        return res.status(400).send({
            error: true,
            message: "Password harus minimal 8 karakter",
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
            message: "User berhasil dibuat",
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
                    message: "Invalid email atau password"
                });
            } else {
                return res.status(500).send({
                    error: true,
                    message: "Kesalahan server internal. Silahkan coba lagi nanti"
                });
            }
        }
        return res.status(200).send({
            error: false,
            message: "Login berhasil!",
            data: result,
        });
    });
};

// get user profile with _id params
exports.userProfile = async (req, res, next) => {
    const { _id } = req.query;

    try {
        if (!_id) {
            return res.status(404).json({
                error: true,
                message: "Dibutuhkan parameter ID"
            });
        }

        const userProfile = await User.find({ _id: _id }).select('-date');

        if (userProfile.length === 0) {
            return res.status(404).json({
                error: true,
                message: "User tidak ditemukan"
            });
        }
        return res.status(200).json({
            error: false,
            message: "User profile berhasil diambil",
            profile: userProfile
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Kesalahan server internal. Silahkan coba lagi nanti"
        });
    }
};

// Function update profile
async function updateProfile(params) {
    const { email, newName, newPassword } = params;

    try {
        let updateFields = { };
        if(newName) updateFields.name = newName;
        if(newPassword) {
            const salt = bcryptjs.genSaltSync(10);
            const hashedPassword = bcryptjs.hashSync(newPassword, salt);
            updateFields.password = hashedPassword;
        }

        // find user by email and update
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('User tidak ditemukan');
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, { new: true });
        return updatedUser;
    } catch (error) {
        throw error;
    }
};

// controller update profile
exports.updateProfile = async (req, res, next) => {
    const { email, newName, newPassword } = req.body;

    // input validation
    if (!email || (!newName && !newPassword)) {
        return res.status(400).send({
            error: true,
            message: "Request body tidak lengkap. Silahkan periksa kembali"
        });
    }

    try {
        const updatedUser = await updateProfile({ email, newName, newPassword });
        return res.status(200).send({
            error: false,
            message: "User profile berhasil diperbarui",
            profile: updatedUser
        });
    } catch (error) {
        return next(error);
    }
};