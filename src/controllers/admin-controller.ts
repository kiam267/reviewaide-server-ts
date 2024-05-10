import { PrismaClient, User } from '@prisma/client';
import { Request, Response } from 'express';
import { comparePassword, hashPassword } from '../utility/password';
import { jwtSign, jwtVerify } from '../utility/jwt';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const prisma = new PrismaClient();
const secret = process.env.VERIFY_SIGNATURE as string;

const getCurrentAdmin = async (req: Request, res: Response) => {
  const { token: authorization } = req.headers;
  //@ts-ignore
  const token = authorization.split(' ')[1];

  try {
    // cookie identity
    type UserStatus = 'pending' | 'active' | 'deactivated';
    const searchUserName = (req.query.fullName as string) || '';
    const searchUserStatus = (req.query.searchUserStatus as UserStatus) || '';
    const searchUserEmail = (req.query.email as string) || '';
    const searchCompanyName = (req.query.companyName as string) || '';
    const searchPhoneNumber = (req.query.phone as string) || '';

    const page = parseInt(req.query.page as string) || 1;
    /* 

{
  page: '1',
  fullName: 'kiam',
  searchUserStatus: '',
  searchUserEmail: '',
  searchPhoneNumber: '',
  searchCompanyName: ''
}
*/
    try {
      const secret = process.env.VERIFY_SIGNATURE as string;
      let payload = jwt.verify(String(token), secret) as jwt.JwtPayload;

      const isAdmin = await prisma.admin.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!(isAdmin?.role === 'admin')) {
        return res.status(200).json({
          data: {},
          pagination: {
            total: 0,
            page: 1,
            pages: 1,
          },
          success: true,
        });
      }
      let where: any = {};
      const total = await prisma.user.count();
      if (total === 0) {
        return res.status(200).json({
          data: {},
          pagination: {
            total: 0,
            page: 1,
            pages: 1,
          },
          success: true,
        });
      }

      if (searchUserName) {
        where.fullName = {
          contains: searchUserName,
        };
      }
      if (searchUserStatus) {
        where.userStatus = {
          contains: searchUserStatus,
        };
      }
      if (searchUserEmail) {
        where.email = {
          contains: searchUserEmail,
        };
      }
      if (searchCompanyName) {
        where.companyName = {
          contains: searchCompanyName,
        };
      }
      if (searchPhoneNumber) {
        where.phone = {
          contains: searchPhoneNumber,
        };
      }
      const pageSize = 10;
      const skip = (page - 1) * pageSize;
      const client = await prisma.user.findMany({
        where,
        select: {
          password: false,
          companyLogo: true,
          companyName: true,
          email: true,
          fullName: true,
          phone: true,
          userStatus: true,
          facebookLink: true,
          id: true,
          googleLink: true,
          createdAt: true,
        },
        skip: skip,
        take: pageSize,
      });
      return res.status(200).json({
        data: client,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / pageSize),
        },
        success: true,
      });
    } catch (error) {
      return res.status(201).json({
        data: {},
        success: false,
        message: 'Invalid token',
        tokenInvalid: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      data: {},
      success: false,
      message: 'Error creating user',
    });
  }
};

const loginCurrentAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });
    if (!admin) {
      return res.status(200).json({
        success: false,
        message: 'Email not exist',
      });
    }

    //@ts-ignore
    const decodePassword = await comparePassword(password, admin.password);

    if (!decodePassword) {
      return res.status(200).json({
        success: false,
        message: 'Email and Password does not match',
      });
    }

    const jwtToken: string = jwtSign({
      id: admin.id,
      fullName: admin?.fullName,
      email: admin?.email,
      role: admin.role,
    });
    if (admin?.role === 'user') {
      return res.status(200).json({
        success: false,
        message:
          'Please wait for one hour as the admin has not yet approved your account.',
      });
    }
    if (admin?.role === 'admin' || admin?.role === 'moderator') {
      return res.status(200).json({
        success: true,
        message: 'Successfully Logined!',
        token: jwtToken,
      });
    }
    if (admin?.userStatus === 'deactived') {
      return res.status(200).json({
        success: false,
        message: 'Admin freeze your account',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const createCurrentAdmin = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;

  try {
    const createUser = await prisma.admin.findUnique({
      where: {
        email: email,
      },
    });
    if (createUser) {
      return res.status(200).json({
        userInfo: false,
        message: 'Admin already exists',
      });
    }

    // bycript Password
    const encodedPassword = await hashPassword(password);
    await prisma.admin.create({
      data: {
        email,
        password: encodedPassword,
        fullName,
      },
    });

    return res.status(200).json({
      userInfo: true,
      message: 'Admin successfully created and go to login page',
    });
  } catch (error) {
    return res.status(500).json({
      userInfo: false,
      message: 'Error creating user',
    });
  }
};
// function watchDirectory(directoryPath: string) {
//   fs.watch(directoryPath, { recursive: true }, (eventType, filename) => {
//     if (eventType === 'rename') {
//       if (!fs.existsSync(`${directoryPath}/${filename}`)) {
//         console.log(`File deleted: ${filename}`);
//       }
//     }
//   });
// }
const deleteClientLink = async (req: Request, res: Response) => {
  const { token: authorization } = req.headers;
  //@ts-ignore
  const token = authorization.split(' ')[1];
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(200).json({
        message: 'User not found',
        success: false,
      });
    }
    try {
      jwt.verify(String(token), secret) as jwt.JwtPayload;
      // await watchDirectory(`src/uploads/${user.companyLogo}`);
      await prisma.user.delete({
        where: {
          email: req.body.email,
        },
      });
      await prisma.client.deleteMany({
        where: {
          email: req.body.email,
        },
      });
      return res.status(200).json({
        message: 'User delete successfully',
        success: true,
      });
    } catch (error) {
      return res.status(201).json({
        success: false,
        message: 'Invalid token',
        tokenInvalid: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const updateUserViaAdmin = async (req: Request, res: Response) => {

  try {
    const {
      companyName,
      googleLink,
      facebookLink,
      fullName,
      phone,
      email,
      userStatus,
      createdAt,
    } = req.body;
    const { token: authorization } = req.headers;
    //@ts-ignore
    const token = authorization.split(' ')[1];

    const admin = await jwtVerify(token);
    if (!admin.success && admin.data?.role === 'admin') {
      return res.status(200).json({
        success: false,
        message: 'Invalid token',
      });
    }
    const Update: any = {};
    if (companyName) {
      Update.companyName = companyName;
    }
    if (googleLink) {
      Update.googleLink = googleLink;
    }
    if (facebookLink) {
      Update.facebookLink = facebookLink;
    }
    if (fullName) {
      Update.fullName = fullName;
    }
    if (phone) {
      Update.phone = phone;
    }
    if (email) {
      Update.email = email;
    }
    if (userStatus === 'active' || 'pending' || 'deactived') {
      Update.userStatus = userStatus;
    }
    const datePattern = /^\d$/;
    if (datePattern.test(createdAt)) {
      Update.createdAt = createdAt;
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(200).json({
        message: 'User not found',
        success: false,
      });
    }
    await prisma.user.updateMany({
      where: {
        email: email,
      },
      data: Update,
    });

    return res.status(200).json({
      message: 'User update successfully',
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export default {
  getCurrentAdmin,
  createCurrentAdmin,
  loginCurrentAdmin,
  deleteClientLink,
  updateUserViaAdmin,
};
