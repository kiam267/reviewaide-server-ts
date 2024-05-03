import express from 'express';
import userController from '../controllers/user-controller';
import { createUserValidation } from '../middlewares/user-validation';
const router = express.Router();

router.get('/', userController.getCurrentUser);
router.post('/', userController.loginCurrentUser);
router.post('/sign-up', createUserValidation, userController.createCurrentUser)
router.post('/user-moredata', userController.userFillUp)
router.post('/user-forget-password', userController.forgetPassword)
router.get('/user-reset-password', userController.resetPasswordCheck);

export default router;
