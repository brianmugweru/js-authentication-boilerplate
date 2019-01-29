var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var uniqueValidator = require('mongoose-unique-validator');
var SALT_WORK_FACTOR = 10;
var Schema = mongoose.Schema;
var jwt = require('jsonwebtoken');
var mailer = require('../config/mailer');
var randomString = require('randomstring');

var UserSchema = new Schema({
    email: { type:String, index: true, unique: true, required: [true, 'add your email']},
    password: { type: String, required: [true, 'enter your name']},
    phone: { type: String, index: true, unique: true, required: [true, 'Add phone number please']},
    name: { type: String, required: [true, 'Enter your name dude']},
    confirmed: { type: Boolean, default: false},
    deactivate: {type: Boolean, default: false},
    confirmation_code: {type: String}
});

UserSchema.post('save', function(doc, next){
  if(this.wasNew) {
    subject = "Confirm Email";
    message = "Please click on the link below to confirm you email. <br><a href='"+process.env.APP_URL+"/confirm/"+doc._id+"/"+doc.confirmation_code+"'>confirm email</a>";
    mailer(doc.email, subject, message);
    next();
  }
});

UserSchema.pre('save', function(next){
    var user = this;
    this.wasNew = this.isNew;

    if(this.isNew)
      this.confirmation_code = randomString.generate({capitalization: 'lowercase'});

    if(!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if(err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) return next(err);
            
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, done){
    return bcrypt.compareSync(candidatePassword, this.password);
}
UserSchema.methods.generateJWT = function() {
  const today = new Date();

  return jwt.sign({
    id: this._id,
    email: this.email,
    name: this.name,
  }, 'your_jwt_secret');
}

UserSchema.methods.toAuthJSON = function() {
  return {
    _id: this._id,
    email: this.email,
    name: this.name,
    token: this.generateJWT(),
  };
};

UserSchema.plugin(uniqueValidator, { message: '{PATH} should be unique'});

module.exports = mongoose.model('user', UserSchema);
