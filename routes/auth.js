var User = require('../models/user');
const passport = require('passport');

module.exports = {
  signup(req, res) {
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
    User.findById(id, (err, user) => {
      if(err) return res.status(400).send(err);
      if(!user) return res.status(404).send('user not found');

      user.confirmed = true;
      user.save((err) => {
        if(err) return res.status(400).send(err);
        return res.status(204);
      });
    });
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
