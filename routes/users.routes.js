const userController = require("../controllers/users.controller");
const express = require("express");


const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/user/profile", userController.userProfile);
router.put("/user/profile", userController.updateProfile);

module.exports = router;