import { Router } from 'express';
import { UserController } from '../controller/user.controller.js';

export const userRouter = Router();

userRouter.use(UserController.checkSession);

userRouter.get('/', UserController.getUserData);
userRouter.post('/section', UserController.createSection);
userRouter.delete('/section', UserController.deleteSection);
userRouter.post('/card', UserController.createCard);
userRouter.delete('/card', UserController.deleteCard)
userRouter.patch('/account', UserController.updateAccount)
