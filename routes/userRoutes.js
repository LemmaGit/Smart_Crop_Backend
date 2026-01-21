const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/express');
const { updateBirthDate } = require('../controllers/userController');

const router = express.Router();

router.post('/me/birthdate', ClerkExpressRequireAuth(), updateBirthDate);

module.exports = router;
