import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { comparePassword, hashPassword } from '../../utility/password';
import { jwtSign } from '../../utility/jwt';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { queueINIT } from '../../utility/messageSender';

const prisma = new PrismaClient();

const getCurrentUser = (req: Request, res: Response) => {};

const loginCurrentUser = async (req: Request, res: Response) => {
  const { email, password } = req.body.user;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    //@ts-ignore
    const decodePassword = await comparePassword(password, user.password);

    if (!decodePassword) {
      return res.status(200).json({
        userInfo: false,
        message: 'Email and Password does not match',
        redirect: false,
      });
    }

    const jwtToken = jwtSign({
      id: user?.id,
      fullName: user?.fullName,
      email: user?.email,
      phone: user?.phone,
      userStatus: user?.userStatus,
    });
    if (user?.userStatus === 'pending') {
      return res.status(200).json({
        userInfo: true,
        message: 'Admin not approved your account',
        redirect: false,
      });
    }
    if (user?.userStatus === 'active') {
      return res.status(200).json({
        userInfo: true,
        message: 'Successfully Logined!',
        redirect: true,
        token: jwtToken,
      });
    }
    if (user?.userStatus === 'deactived') {
      return res.status(200).json({
        userInfo: true,
        message: 'Admin freeze your account',
        redirect: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      userInfo: false,
      message: 'Error creating user',
      redirect: false,
    });
  }
};

const createCurrentUser = async (req: Request, res: Response) => {
  const { email, fullName, password, phone } = req.body;

  try {
    const createUser = await prisma.user.findUnique({
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
    const encodedPassword = await hashPassword(password);
    await prisma.user.create({
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
  } catch (error) {
    return res.status(500).json({
      userInfo: false,
      message: 'Error creating user',
    });
  }
};

const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email, link } = req.body;
    const queue = queueINIT('forget-password');

    const user = await prisma.user.findUnique({
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
      id: user?.id,
      email: user?.email,
    };

    //@ts-ignore
    const secret = process.env.VERIFY_SIGNATURE + user.password;

    const forget_token = await jwt.sign(payload, secret, {
      expiresIn: '15m',
    });

    const reset_link = `${link}/user/reset-password/${user?.id}/${forget_token}`;

    console.log(reset_link);

    await queue.add(`forget-password`, {
      link: reset_link,
      email: user?.email,
    });

    res.status(200).json({
      success: true,
      message: 'Please check your email ',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const resetPasswordCheck = async (req: Request, res: Response) => {
  const { id, token } = req.headers;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
    });

  
 
    if (user === null) {
      return res.json({});
    }

    const secret = process.env.VERIFY_SIGNATURE + user.password;

    let payload = jwt.verify(String(token), secret);
    try {
      let payload = jwt.verify(String(token), secret);
      // Token is valid
    } catch (error) { 
      
    }
    
  } catch (error) {
    console.log(error);
    // Handle error appropriately
    res.json({});
  }
};

const userFillUp = async (req: Request, res: Response) => {
  // const
};

export default {
  getCurrentUser,
  createCurrentUser,
  loginCurrentUser,
  forgetPassword,
  resetPasswordCheck,
  userFillUp,
};
