const { expect, assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../app');
const User = require('../../models/user');
const sinon = require('sinon');
const stub = sinon.stub().throws();
const auth = require('../../routes/auth');
const faker = require('faker');
const _ = require('lodash');
const mongoose = require('mongoose');
const randomString = require('randomstring');
chai.use(chaiHttp);

let token;



describe('Authentication', () => {
  const login = '/login';
  const signup = '/signup';
  const profile = '/profile';
  const password = faker.internet.password()
  const phone = faker.phone.phoneNumber()

  const user = {
    email: faker.internet.email(),
    password: password,
    passwordConfirmation: password,
    phone: faker.phone.phoneNumber(),
    name: faker.name.findName(),
    confirmed: true,
    confirmation_code: randomString.generate({capitalization: 'lowercase'}),
  }
  const preSave = {
    email: 'mr.sometest@exmp.com',
    password: password,
    passwordConfirmation: password,
    phone: phone,
    name: faker.name.findName(),
    confirmed: false,
  }

  before(done => {
    chai
      .request(app)
      .post(signup)
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(200);
        token = res.body.token;
        done();
      });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => {
      console.log('\n Test Database Dropped');
    });
    mongoose.connection.close(() => {
      done();
    });
    process.exit();
    done();
  });

  it('should create new user if email not found', done => {
    chai
      .request(app)
      .post(signup)
      .send(user)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(200);
        expect(res.body).not.be.empty;
        expect(res.body).to.have.property('token');
        done();
      });
  });

  it('should return 422 if email was found', done => {
    chai
      .request(app)
      .post(signup)
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(422);
        expect(res.body.errors).to.be.an.instanceOf(Array);
        expect(_.map(res.body.errors, 'msg')).to.be.an('array').that.includes('E-mail already in use');
        done();
      });
  });

  it('should get user token on user login', (done) => {
    chai
      .request(app)
      .post(login)
      .send({ email: 'mr.sometest@exmp.com', password: password})
      .end(function(err, res){
        if(err) throw err;
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.own.property('token');
        done();
      });
  });

  it('should get profile if token is passed in auth header', done => {
    chai
      .request(app)
      .get(profile)
      .set('Authorization', `Bearer ${ token }`)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('email', preSave.email);
        done();
      });
  });

  it('should give 401 for profile if token is not passed', done => {
    chai
      .request(app)
      .get(profile)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should not get token when no user in db found', (done) => {
    chai
      .request(app)
      .post(login)
      .send({ email: 'user@example.com', password: 'secret' })
      .end((err, res) => {
        if(err) throw err;
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.text).to.be.a('string');
        expect(res.text).to.contain('Sorry, Wrong username or password');
        done();
      });
  });

  it('should not get token when password is wrong', (done) => {
    chai
      .request(app)
      .post(login)
      .send({ email: 'mr.sometest@exmp.com', password: 'wrong' })
      .end((err, res) => {
        if(err) throw err;
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.text).to.be.a('string');
        expect(res.text).to.contain('Sorry, Wrong username or password');
        done();
      });
  });

  it('should not signup users if phone number is not unique', (done) => {
    let current_email = preSave.email;
    preSave.email = 'new_email@exmp.com';
    chai
      .request(app)
      .post('/signup')
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(400);
        expect(res.text).to.be.a('string');
        expect(res.text).to.have.string('phone should be unique');
        done();
      });
    preSave.email = current_email;
  });

  it('should not signup users if phone number and email are not unique', (done) => {
    chai
      .request(app)
      .post('/signup')
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(422);
        expect(res.body).to.have.property('errors');
        expect(_.map(res.body.errors, 'msg')).to.be.an('array').that.includes('E-mail already in use');
        done();
      });
  });

  it('should not signup users if email is missing', (done) => {
    let current_email = preSave.email;
    preSave.email = '';
    chai
      .request(app)
      .post('/signup')
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(422);
        expect(res.body).to.have.property('errors');
        done();
      });
    preSave.email = current_email;
  });

  it('should not signup users if phone is missing', (done) => {
    let curr_phone = preSave.phone;
    let curr_email = preSave.email;
    preSave.email = 'new_emm@exmp.com';
    preSave.phone = '';
    chai
      .request(app)
      .post('/signup')
      .send(preSave)
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(422);
        expect(res.body).to.have.property('errors');
        expect(_.map(res.body.errors, 'msg')).to.be.an('array').that.includes('Phone Number is really required, we do need to spam you with messages you know');
        done();
      });
    preSave.phone = curr_phone;
    preSave.email = curr_email;
  });

  it.skip('should confirm user after clicking link on email', async (done) => {
    let savedUser = await User.findOne({email: preSave.email});

    chai
      .request(app)
      .get('/confirm/'+savedUser._id+'/'+savedUser.confirmation_code)
      .end((err, res) => {
        if(err) throw err;
        expect(res.status).to.equal(200);
        expect(res.text).to.equal('email confirmed successfully');
        done();
      });
  });

  it.skip('should send email to user on request of password reset', (done) => {
    User.deleteMany((err) => {
      User.create({email: 'brian@example.com', password: 'secret', name: 'hello dude'}, (err, user) => {
        chai
          .request(app)
          .post('/user/send/reset/email')
          .send({email: 'brian@example.com'})
          .end((err, res) => {
            if(err) throw err;
            expect(res).to.have.status(200);
            expect(res.text).to.have.string('email sent to brian@example.com');
            done();
        });
      });
    });
  });

  it.skip('should not send password reset email if user does not exist', (done) => {
    User.deleteMany((err) => {
      chai.request(app)
        .post('/user/send/reset/email')
        .send({email: 'brian@example.com'})
        .end((err, res) => {
          if(err) throw err;
          expect(res).to.have.status(200);
          expect(res.text).to.have.string('email does not exist on our system');
          done();
      });
    });
  });

  it.skip('should reset user password', (done) => {
    User.deleteMany((err) => {
      chai.request(app)
        .post('/user/password/reset')
        .send({email: 'brian@example.com', password: 'secret', password_confirm: 'secret'})
        .end((err, res) => {
          if(err) throw err; 
          expect(res).to.have.status(200);
          expect(res.text).to.have.string('email reset successfully');
          done();
      });
    });
  });
});
