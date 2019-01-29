var express = require('express');
var passport = require('passport');
var router = express.Router();
var authRouter = require('./auth');
var { loginValidations, signupValidations } = require('./auth');
const { check } = require('express-validator/check');

router.post('/login', loginValidations(), authRouter.login);
router.post('/signup', signupValidations(), authRouter.signup);
router.get('/confirm/:id/:confirmation_code', authRouter.confirm);

router.get('/profile', passport.authenticate('jwt', { session: false }), authRouter.profile);

module.exports = router;
