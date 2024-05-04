"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_1 = require("../../utility/password");
const jwt_1 = require("../../utility/jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const messageSender_1 = require("../../utility/messageSender");
const prisma = new client_1.PrismaClient();
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token: authorization } = req.headers;
    //@ts-ignore
    const token = authorization.split(' ')[1];
    try {
        // cookie identity
        try {
            const secret = process.env.VERIFY_SIGNATURE;
            let payload = jsonwebtoken_1.default.verify(String(token), secret);
            const user = yield prisma.user.findUnique({
                where: {
                    id: payload.id,
                },
            });
            if (!(user === null || user === void 0 ? void 0 : user.isValid)) {
                return res.status(200).json({
                    userInfo: false,
                    message: '',
                    redirect: false,
                    verify: false,
                });
            }
        }
        catch (error) {
            return res.status(201).json({
                success: false,
                message: 'Invalid token',
                tokenInvalid: true,
                redirect: true,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating user',
        });
    }
});
const loginCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body.user;
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        //@ts-ignore
        const decodePassword = yield (0, password_1.comparePassword)(password, user.password);
        if (!decodePassword) {
            return res.status(200).json({
                userInfo: false,
                message: 'Email and Password does not match',
                redirect: false,
            });
        }
        const jwtToken = (0, jwt_1.jwtSign)({
            id: user === null || user === void 0 ? void 0 : user.id,
            fullName: user === null || user === void 0 ? void 0 : user.fullName,
            email: user === null || user === void 0 ? void 0 : user.email,
            phone: user === null || user === void 0 ? void 0 : user.phone,
            userStatus: user === null || user === void 0 ? void 0 : user.userStatus,
        });
        if ((user === null || user === void 0 ? void 0 : user.userStatus) === 'pending') {
            return res.status(200).json({
                userInfo: true,
                message: 'Admin not approved your account',
                redirect: false,
            });
        }
        if ((user === null || user === void 0 ? void 0 : user.userStatus) === 'active') {
            return res.status(200).json({
                userInfo: true,
                message: 'Successfully Logined!',
                redirect: true,
                token: jwtToken,
            });
        }
        if ((user === null || user === void 0 ? void 0 : user.userStatus) === 'deactived') {
            return res.status(200).json({
                userInfo: true,
                message: 'Admin freeze your account',
                redirect: false,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            userInfo: false,
            message: 'Error creating user',
            redirect: false,
        });
    }
});
const createCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, fullName, password, phone } = req.body;
    try {
        const createUser = yield prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (createUser) {
            return res.status(200).json({
                userInfo: false,
                message: 'User already exists',
            });
        }
        // bycript Password
        const encodedPassword = yield (0, password_1.hashPassword)(password);
        yield prisma.user.create({
            data: {
                email,
                password: encodedPassword,
                fullName,
                phone,
            },
        });
        return res.status(500).json({
            userInfo: true,
            message: 'User successfully created',
        });
    }
    catch (error) {
        return res.status(500).json({
            userInfo: false,
            message: 'Error creating user',
        });
    }
});
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, link } = req.body;
        const queue = (0, messageSender_1.queueINIT)('forget-password');
        const user = yield prisma.user.findUnique({
            where: {
                email: String(email),
            },
        });
        if (!user) {
            return res.status(201).json({
                success: false,
                message: 'Email does not exist',
            });
        }
        const payload = {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
        };
        //@ts-ignore
        const secret = process.env.VERIFY_SIGNATURE + user.password;
        const forget_token = yield jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: '15m',
        });
        const reset_link = `${link}/user/reset-password/${user === null || user === void 0 ? void 0 : user.id}/${forget_token}`;
        console.log(reset_link);
        yield queue.add(`forget-password`, {
            link: reset_link,
            email: user === null || user === void 0 ? void 0 : user.email,
        });
        res.status(200).json({
            success: true,
            message: 'Please check your email ',
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating user',
        });
    }
});
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, token } = req.headers;
        const { password } = req.body;
        // user identity
        const user = yield prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!user) {
            return res.status(201).json({
                success: false,
                message: 'User does not exist',
            });
        }
        // cookie identity
        try {
            const secret = process.env.VERIFY_SIGNATURE + user.password;
            let payload = jsonwebtoken_1.default.verify(String(token), secret);
            if (!payload) {
                return res.status(201).json({
                    success: false,
                    message: 'User already  changed password',
                });
            }
        }
        catch (error) {
            return res.json({
                success: false,
                message: 'Invalid token',
            });
        }
        // password reset
        const encodedPassword = yield (0, password_1.hashPassword)(password);
        yield prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                password: encodedPassword,
            },
        });
        return res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating user',
        });
    }
});
const putUserMoreDetailInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { companyLogo, companyName, googleLink, facebookLink, formData } = req.body;
        const { token: authorization, imageLink } = req.headers;
        //@ts-ignore
        const token = authorization.split(' ')[1];
        const user = (0, jwt_1.jwtVerify)(token);
        console.log(req.file);
        try {
            if (!(yield user).success) {
                return res.status(200).json({
                    userInfo: false,
                    message: '',
                    redirect: false,
                    verify: false,
                });
            }
        }
        catch (error) {
            return res.status(201).json({
                success: false,
                message: 'Invalid token',
                tokenInvalid: true,
                redirect: true,
            });
        }
        // await prisma.user.updateMany({
        //   where: {
        //     id: Number(req.headers.id),
        //   },
        //   data: {
        //     companyLogo,
        //     companyName,
        //     googleLink,
        //     facebookLink,
        //   },
        // });
        res.send('fjkdsfjksdf');
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error creating user',
        });
    }
});
exports.default = {
    getCurrentUser,
    createCurrentUser,
    loginCurrentUser,
    forgetPassword,
    resetPassword,
    putUserMoreDetailInfo,
};
