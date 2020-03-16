import { Router } from 'express';
import * as swaggerUI from 'swagger-ui-express';
import * as swaggerDocument from '../../swagger.json';
import {
  login,
  loginValidator,
  register,
  registerValidator,
  activate,
} from '../controllers/auth.ctrl';
import { getAll } from '../controllers/user.ctrl';

const AuthRouter = Router();
AuthRouter.post('/login', loginValidator, login);
AuthRouter.post('/register', registerValidator, register);
AuthRouter.get('/activate/:activationToken', activate);

const UserRouter = Router();
UserRouter.get('/', getAll);

const SwaggerAPIRouter = Router();

const router = Router();
/**
 * Add swagger endpoints
 */
router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
router.use('/api/v1', SwaggerAPIRouter);
router.use('/auth', AuthRouter);
router.use('/users', UserRouter);

export default router;
