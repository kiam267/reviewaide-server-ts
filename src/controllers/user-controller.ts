import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { comparePassword, hashPassword } from '../../utility/password';
import { jwtSign, jwtVerify } from '../../utility/jwt';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { queueINIT } from '../../utility/messageSender';

const prisma = new PrismaClient();

const getCurrentUser = async (req: Request, res: Response) => {
  const { token: authorization } = req.headers;
  //@ts-ignore
  const token = authorization.split(' ')[1];

  try {
    // cookie identity
    try {
      const secret = process.env.VERIFY_SIGNATURE as string;
      let payload = jwt.verify(String(token), secret) as jwt.JwtPayload;

      const user = await prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user?.isValid) {
        return res.status(200).json({
          userInfo: false,
          message: '',
          redirect: false,
          verify: false,
        });
      }
    } catch (error) {
      return res.status(201).json({
        success: false,
        message: 'Invalid token',
        tokenInvalid: true,
        redirect: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

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

const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id, token } = req.headers;
    const { password } = req.body;

    // user identity
    const user = await prisma.user.findUnique({
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

      let payload = jwt.verify(String(token), secret);
      if (!payload) {
        return res.status(201).json({
          success: false,
          message: 'User already  changed password',
        });
      }
    } catch (error) {
      return res.json({
        success: false,
        message: 'Invalid token',
      });
    }

    // password reset
    const encodedPassword = await hashPassword(password);
    await prisma.user.update({
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const putUserMoreDetailInfo = async (req: Request, res: Response) => {
  try {
    const { companyLogo, companyName, googleLink, facebookLink, formData } =
      req.body;
    const { token: authorization, imageLink } = req.headers;
    //@ts-ignore
    const token = authorization.split(' ')[1];

    const user = jwtVerify(token);
    console.log(req.file);

    try {
      if (!(await user).success) {
        return res.status(200).json({
          userInfo: false,
          message: '',
          redirect: false,
          verify: false,
        });
      }
    } catch (error) {
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
    res.send('fjkdsfjksdf')
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
  loginCurrentUser,
  forgetPassword,
  resetPassword,
  putUserMoreDetailInfo,
};
