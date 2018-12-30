var express = require('express');
var router = express.Router();
var authRouter = require('./auth');

router.post('/login', authRouter.login);
router.post('/signup', authRouter.signup);

module.exports = router;
