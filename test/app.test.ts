import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as app from '../src/server';
import { default as UserService } from '../src/services/user.srvc';
import { User } from '../src/models/user';

chai.use(chaiHttp);
const request = chai.request;
const { expect } = chai;

let JWT: string;

afterAll(done => {
  UserService.deleteOne('testerchester').then(done);
});

describe('GET /random-url', () => {
  it('should return 401', async () => {
    request(app)
      .get('/reset')
      .end((err, res) => {
        expect(res).to.have.status(401);
      });
  });
});

describe('/auth', () => {
  let user: User;
  const userForm = {
    email: 'tester@chester.com',
    password: 'PASSWORD',
    lname: 'Tester',
    fname: 'Chester',
    role: 'guest',
    username: 'testerchester',
  };

  describe('POST /register', () => {
    const route = '/auth/register';

    it('should return 200', async () => {
      request(app)
        .post(route)
        .send(userForm)
        .end((err, res) => {
          expect(res).to.have.status(200);
        });
    });

    it('should return 409', async () => {
      request(app)
        .post(route)
        .send(userForm)
        .end((err, res) => {
          expect(res).to.have.status(409);
        });
    });
  });

  describe('GET /activate/:activationToken', () => {
    const route = '/auth/activate';
    const BAD_TOKEN = '123456789';

    it('should return 400', async () => {
      request(app)
        .get(`${route}/${BAD_TOKEN}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
        });
    });

    it('should return 200', async () => {
      request(app)
        .get(`${route}/${user.activationToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          JWT = res.body.token;
        });
    });
  });

  describe('POST /login', () => {
    const route = '/auth/login';

    it('should return 401, missing password', async () => {
      request(app)
        .post(route)
        .send({ email: 'some@email.com' })
        .end((err, res) => {
          expect(res).to.have.status(401);
        });
    });

    it('should return 401, missing email', async () => {
      request(app)
        .post(route)
        .send({ password: 'somepassword' })
        .end((err, res) => {
          expect(res).to.have.status(401);
        });
    });

    it('should return 404', async () => {
      request(app)
        .post(route)
        .send({ email: 'none@nowhere.com', password: 'PASSWORD' })
        .end((err, res) => {
          expect(res).to.have.status(404);
        });
    });

    it('should return 200', async () => {
      request(app)
        .post('/auth/login')
        .send({ email: 'tester@chester.com', password: 'PASSWORD' })
        .end((err, res) => {
          expect(res).to.have.status(200);
        });
    });
  });
});

describe('GET /users', () => {
  const route = '/users';

  it('should return 401', async () => {
    request(app)
      .get(route)
      .end((err, res) => {
        expect(res).to.have.status(401);
      });
  });

  it('should return 200', async () => {
    request(app)
      .get(route)
      .set('Authorization', `Bearer ${JWT}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
      });
  });
});
