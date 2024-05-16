import express from 'express';
import clientController from '../controllers/client-controller';
import { jwtChecker } from '../middlewares/jwt-checker';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  // limits: {
  //   fileSize: 1024 * 1024 * 5, //5mb
  // },
});

const router = express.Router();
router.get('/', clientController.getClient);
router.post('/', clientController.createClient);
router.get('/link-generator', jwtChecker, clientController.getClientLink);
router.post(
  '/link-generator',
  jwtChecker,
  upload.single('companyLogo'),
  clientController.createClientLink
);
router.delete('/link-generator', jwtChecker, clientController.deleteClientLink);
router.get('/link-logo-query', clientController.getReviewLogo);

export default router;
