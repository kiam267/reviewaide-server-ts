import express from 'express';
import userController from '../controllers/user-controller';
import { createUserValidation } from '../middlewares/user-validation';
import multer from 'multer';
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5mb
  },
});

router.get('/', userController.getCurrentUser);
router.post('/', userController.loginCurrentUser);
router.post('/sign-up', createUserValidation, userController.createCurrentUser)
router.put(
  '/user-moredata',
  upload.single('companyLogo'),
  userController.putUserMoreDetailInfo
);
router.post('/user-forget-password', userController.forgetPassword)
router.post('/user-reset-password', userController.resetPassword);

export default router;
