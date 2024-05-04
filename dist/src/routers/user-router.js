"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user-controller"));
const user_validation_1 = require("../middlewares/user-validation");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, //5mb
    },
});
router.get('/', user_controller_1.default.getCurrentUser);
router.post('/', user_controller_1.default.loginCurrentUser);
router.post('/sign-up', user_validation_1.createUserValidation, user_controller_1.default.createCurrentUser);
router.put('/user-moredata', upload.single('companyLogo'), user_controller_1.default.putUserMoreDetailInfo);
router.post('/user-forget-password', user_controller_1.default.forgetPassword);
router.post('/user-reset-password', user_controller_1.default.resetPassword);
exports.default = router;
