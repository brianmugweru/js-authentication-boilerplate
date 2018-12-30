const { expect, assert } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const db = require('./connection');
const User = require('../models/user');
chai.use(chaiHttp);

before((done) => {
  db.on('error', console.error.bind(console, 'connection error'));
  db.once('open', () => {
    db.dropCollection('users', () => {
      done();
    });
  });
});

after((done) => {
  process.exit();
  done();
});


describe('Authentication', () => {
  beforeEach((done) => {
    User.deleteMany(() => {
      done();
    });
  });

  it('should get user token on user login', (done) => {
    User.create({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'}, function(err, user){
      chai
        .request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'secret' })
        .end((err, res) => {
          if(err) throw err;
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.have.own.property('token');
          done();
        });
    });
  });

  it('should not get token when no user in db found', (done) => {
    User.create({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'}, function(err, user){
      chai
        .request(app)
        .post('/login')
        .send({ email: 'user1@example.com', password: 'secret' })
        .end((err, res) => {
          if(err) throw err;
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.text).to.be.a('string');
          expect(res.text).to.contain('Sorry, Wrong username or password');
          done();
        });
    });
  });

  it('should not get token when password is wrong', (done) => {
    User.create({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'}, function(err, user){
      chai
        .request(app)
        .post('/login')
        .send({ email: 'user@example.com', password: 'wrong' })
        .end((err, res) => {
          if(err) throw err;
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.text).to.be.a('string');
          expect(res.text).to.contain('Sorry, Wrong username or password');
          done();
        });
    });
  });
  it('should signup user with correct credentials', (done) => {
    chai
      .request(app)
      .post('/signup')
      .send({email: 'user@example.com', password: 'secret', phone: '+254710812964', name: 'test user'})
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.own.property('token');
        done();
      });
  });

  it('should not signup users if email is not unique', (done) => {
    var user = new User({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'});
    user.save(function(err, user){
      chai
        .request(app)
        .post('/signup')
        .send({
          email: 'user@example.com', password: 'secret', phone: '+25412421232', name: 'whatever'
        })
      .end((err, res) => {
        if(err) throw err;
        expect(res).to.have.status(400);
        expect(res.text).to.be.a('string');
        expect(res.text).to.have.string('email should be unique');
        done();
      });
    });
  });


  it('should not signup users if phone number is not unique', (done) => {
    User.deleteMany((err) => {
      User.create({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'}, function(err, user){
        chai
          .request(app)
          .post('/signup')
          .send({email: 'user1@example.com', password: 'secret', phone: '+254712832342', name: 'whoever'})
          .end((err, res) => {
            if(err) throw err;
            expect(res).to.have.status(400);
            expect(res.text).to.be.a('string');
            expect(res.text).to.have.string('phone should be unique');
            done();
        });
      });
    });
  });

  it('should not signup users if phone number and email are not unique', (done) => {
    User.deleteMany((err) => {
      User.create({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'}, function(err, user){
        chai
          .request(app)
          .post('/signup')
          .send({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'})
          .end((err, res) => {
            if(err) throw err;
            expect(res).to.have.status(400);
            expect(res.text).to.be.a('string');
            expect(res.text).to.have.string('phone should be unique');
            expect(res.text).to.have.string('email should be unique');
            done();
        });
      });
    });
  });

  it('should not signup users if email is missing', (done) => {
    User.deleteMany((err) => {
      chai
        .request(app)
        .post('/signup')
        .send({email: '', password: 'secret', phone: '+2541234231', name: 'hello dude'})
        .end((err, res) => {
          if(err) throw err;
          expect(res).to.have.status(400);
          expect(res.text).to.be.a('string');
          expect(res.text).to.have.string('add your email');
          done();
        });
    });
  });

  it('should not signup users if phone is missing', (done) => {
    User.deleteMany((err) => {
      chai
        .request(app)
        .post('/signup')
        .send({email: 'user@example.com', password: 'secret', phone: '', name: 'hello dude'})
        .end((err, res) => {
          if(err) throw err;
          expect(res).to.have.status(400);
          expect(res.text).to.be.a('string');
          expect(res.text).to.have.string('Add phone number please');
          done();
        });
    });
  });

  // make unit test
  it('confirm password is encrypted', (done) => {
    var user = new User({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'});
    user.save((err, user) => {
      assert.notEqual('secret', user.password);
      done();
    });
  });

  it('confirm it compares passwords', (done) => {
    var user = new User({email: 'user@example.com', password: 'secret', phone: '+254712832342', name: 'hello dude'});
    user.save((err, user) => {
     // console.log(user.comparePassword('secret'));
      assert.equal(user.comparePassword('secret'), true);
      done();
    });
  });

});
