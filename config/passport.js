const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('../models/user');

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false
},
((req, email, password, done) => {
    User.findOne({ email: email }, function (err, user) {
      if (err) return done(err);

      if (!user) return done(null, false);

      if (!user.comparePassword(password)) return done(null, false);

      return done(null, user, { message: 'Logged in Successfully' });
    });
})));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'your_jwt_secret',
},
((jwtPayload, done) => {
  return done(null, jwtPayload);
})));
