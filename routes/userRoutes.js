const express = require("express");
const { requireAuth } = require("@clerk/express");
const { updateUser } = require("../controllers/userController");

const router = express.Router();

router.patch("/me", requireAuth(), updateUser);

module.exports = router;
