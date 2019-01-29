const User = require('../models/user');
const passport = require('passport');
const { check, validationResult, body } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const nodemailer = require('nodemailer');

module.exports = {
  loginValidations() {
    return [
      check('email')
        .isEmail()
        .not()
        .isEmpty()
        .withMessage('email is required to continue')
        .normalizeEmail(),
      check('password')
        .not()
        .isEmpty()
        .withMessage('Please stop fooling around, Add a pasword')
    ];
  },

  signupValidations() {
    return [
      check('email')
        .isEmail()
        .not()
        .isEmpty()
        .withMessage('Email is required to sign up')
        .normalizeEmail()
        .custom(email => {
          return User.findOne({email: email}).then(user => {
            if(user) return Promise.reject('E-mail already in use');
          });
        }),
      check('password')
        .isLength({ min: 5 })
        .not()
        .isEmpty()
        .withMessage('I do still need a password though to continue'),
      body('passwordConfirmation')
        .not()
        .isEmpty()
        .custom((value, {req}) => {
          if(value !== req.body.password) {
            console.log(value, req.body.password);
            throw new Error('Woooow, bro/sissy, those two passwords do not match');
          }else {
            return value;
          }
        }),
      check('name')
        .not()
        .isEmpty()
        .withMessage('You really are getting on my nerves, How hard is adding you name??')
        .isLength({ max: 255 })
        .withMessage('Excuse me, Is your name that long, max policy of 255 characters, adhere to that'),
      check('phone')
        .not()
        .isEmpty()
        .withMessage('Phone Number is really required, we do need to spam you with messages you know')
        .custom(phone => {
          return User.findOne({phone: phone}).then(user => {
            if(user) return Promise.reject('Its either you already have an account or that phone number ain\'t yours, use your own!');
          }).catch(err => console.log(err));
        })
    ];
  },

  signup(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    var user = new User(req.body); 
    user.save((err, user) => {
      if(err) return res.status(400).send(err);

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        const token = user.generateJWT();
        return res.status(200).json({ token });
      });
    });
  },

  login(req, res) {
    passport.authenticate('local', { session: false }, (err, user) => {
      if(err) throw err;

      if (!user) {
        return res.status(400).json({
          message: 'Sorry, Wrong username or password',
          user,
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.send(err);
        }
        const token = user.generateJWT();
        return res.json({ token });
      });

    })(req, res);
  },

  confirm(req, res) {
    User.findById(req.params.id, (err, user) => {
      if(err) return res.status(400).send(err);
      if(!user) return res.status(404).send('user does not exist');

      if(user.confirmation_code === req.params.confirmation_code) {
        user.confirmed = true;
        user.updateOne((err, user) => {
          if(err) return res.status(400).send(err);
          return res.status(200).send('email confirmed successfully');
        });
      }
    });
  },

  profile(req, res) {
    return res.status(200).send(req.user);
  },

  reset(req, res) {
    User.findOne({_id: req.params.id, reset_token: req.params.reset_token}, (err, user) => {
      if(err) throw err;

      user.password = req.body.password;
      user.save((err, user) => {
        req.login(user, { session: false }, (err) => {
          if (err) {
            return res.send(err);
          }
          const token = user.generateJWT();
          return res.json({ token });
        });
      });
    });
  },

  deactivate(req, res) {
    User.findById(id, (err, user) => {
      if(err) return res.status(400).send(user);
      if(!user) return res.status(404).send('user not found');
      user.deactivate = true;
      user.save((err) => {
        return res.status(200).send('deactivated successfully');
      });
    });
  }
}
