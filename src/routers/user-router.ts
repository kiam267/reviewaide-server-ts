import express from 'express';
import userController from '../controllers/user-controller';
import { createUserValidation } from '../middlewares/user-validation';
import multer from 'multer';
const router = express.Router();




let imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './src/uploads');
  },
  filename: (req, file, callback) => {
    const extention = file.mimetype.split('/')[1];
    callback(null, `image-${Date.now()}.${extention}`);
  },
});

// img filter
const isImage = (req:Express.Multer.File, file: Express.Multer.File, callback: any) => {

  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(null, Error('only image is allowd'));
  }
};

let upload = multer({
  storage: imgconfig,
  //@ts-ignore
  fileFilter: isImage,
});

router.get('/', userController.getCurrentUser);
router.post('/', userController.loginCurrentUser);
router.post('/sign-up', createUserValidation, userController.createCurrentUser);
router.put(
  '/user-moredata',
  upload.single('companyLogo'),
  userController.putUserMoreDetailInfo
);
router.post('/user-forget-password', userController.forgetPassword);
router.post('/user-reset-password', userController.resetPassword);
router.get('/header', userController.getHeader);
router.get('/profile', userController.getProfile);

export default router;
