import express from 'express';
import adminController from '../controllers/admin-controller';
const router = express.Router();

router.post('/', adminController.loginCurrentAdmin);
router.get('/', adminController.getCurrentAdmin);
router.delete('/', adminController.deleteClientLink);
router.post('/sign-up', adminController.createCurrentAdmin);

export default router;  