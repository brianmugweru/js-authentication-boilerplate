const chai = require('chai');
const faker = require('faker');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');
const log = console.log;

const { expect } = require('chai');

const User = require('../../models/user');
const userController = rewire('../../routes/auth');
chai.use(sinonChai);

let sandbox = null;

describe('Users Controller', () => {
  let req = {
    user: { id: faker.random.number() },
    value: {
      body: {
        email: faker.internet.email(),
        password: faker.internet.password(),
      }
    }
  }
  let res = {
    json() {
      return this;
    },
    status() {
      return this;
    }
  }
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  afterEach(() => {
    sandbox.restore();
  });
  describe('User Controller', () => {
    describe('login', () => {
      it('should return token when login is called', () => {
        sandbox.spy(res, 'json');
        return userController.login(req, res).then(() => {
          expect(res.json).to.have.been.called;
        });
      });
    });
  });
});

