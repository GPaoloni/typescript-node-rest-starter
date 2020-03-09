/* eslint-disable @typescript-eslint/no-unused-vars */
import request = require('supertest');
import app from '../src/server';
import { default as UserService } from '../src/services/user.srvc';
import { User } from '../src/types/user';
import * as chalk from 'chalk';

let JWT: string;
// utility for logging a very visible message
const spit = (arg: string | {}): void => {
  if (typeof arg === 'string') {
    console.log(chalk.bgRed(arg));
  } else {
    console.log(chalk.bgRed(JSON.stringify(arg)));
  }
};

afterAll(done => {
  UserService.deleteOne('testerchester').then(done);
  app.close();
});

describe('GET /random-url', () => {
  it('should return 401', async () => {
    await request(app)
      .get('/reset')
      .expect(401);
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
      const response = await request(app)
        .post(route)
        .send(userForm)
        .expect(200);
      user = response.body;
    });

    it('should return 409', async () => {
      await request(app)
        .post(route)
        .send(userForm)
        .expect(409);
    });
  });

  describe('GET /activate/:activationToken', () => {
    const route = '/auth/activate';
    const BAD_TOKEN = '123456789';

    it('should return 400', async () => {
      await request(app)
        .get(`${route}/${BAD_TOKEN}`)
        .expect(400);
    });

    it('should return 200', async () => {
      const response = await request(app)
        .get(`${route}/${user.activationToken}`)
        .expect(200);
      JWT = response.body.token;
    });
  });

  describe('POST /login', () => {
    const route = '/auth/login';

    it('should return 401, missing password', async () => {
      const response = await request(app)
        .post(route)
        .send({ email: 'some@email.com' })
        .expect(401);
    });

    it('should return 401, missing email', async () => {
      const response = await request(app)
        .post(route)
        .send({ password: 'somepassword' })
        .expect(401);
    });

    it('should return 404', async () => {
      const response = await request(app)
        .post(route)
        .send({ email: 'none@nowhere.com', password: 'PASSWORD' })
        .expect(404);
    });

    it('should return 200', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'tester@chester.com', password: 'PASSWORD' })
        .expect(200);
    });
  });
});

describe('GET /users', () => {
  const route = '/users';

  it('should return 401', async () => {
    const response = await request(app)
      .get(route)
      .expect(401);
  });

  it('should return 200', async () => {
    const response = await request(app)
      .get(route)
      .set('Authorization', `Bearer ${JWT}`)
      .expect(200);
  });
});
