import express from 'express';
import clientController from '../controllers/client-controller';
import { jwtChecker } from '../middlewares/jwt-checker';

const router = express.Router();
router.get('/', clientController.getClient);
router.post('/', clientController.createClient);
router.get('/link-generator', jwtChecker, clientController.getClientLink);
router.post('/link-generator', jwtChecker, clientController.createClientLink);
router.delete('/link-generator', jwtChecker, clientController.deleteClientLink);
router.get('/link-logo-query', clientController.getReviewLogo);

export default router;
