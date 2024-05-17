import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
import uniqid from 'uniqid';
const prisma = new PrismaClient();

const getClient = async (req: Request, res: Response) => {
  const { token: authorization } = req.headers;
  //@ts-ignore
  const token = authorization.split(' ')[1];

  try {
    // cookie identity
    const searchClientName = (req.query.clientName as string) || '';
    const searchMethod = (req.query.method as string) || '';
    const searchRating = (req.query.rating as string) || 0;

    const page = parseInt(req.query.page as string) || 1;

    try {
      const secret = process.env.VERIFY_SIGNATURE as string;
      let payload = jwt.verify(String(token), secret) as jwt.JwtPayload;

      let where: any = {
        email: payload.email,
      };
      if (Number(searchRating)) {
        where.rating = Number(searchRating);
      }

      let total: any;
      total = await prisma.client.count({
        where,
      });

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

      /* {
          contains: searchUserStatus,
        }; */
      // if (
      //   (Boolean(searchMethod) && searchMethod === 'facebook') ||
      //   'google' ||
      //   'private'
      // ) {
      //   where.method = searchMethod;
      // }
      // if (searchClientName) {
      //   where.clientName = searchClientName;
      // }

      const pageSize = 10;
      const skip = (page - 1) * pageSize;
      const client = await prisma.client.findMany({
        where,
        skip: skip,
        take: pageSize,
      });

      console.log(total);
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
      console.log(error);

      return res.status(201).json({
        data: {},
        success: false,
        message: 'Invalid token',
        // tokenInvalid: true,
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
const createClient = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        success: false,
        message: 'client ID not valid',
      });
    }
    let post: any = {};

    let client = await prisma.qrCodeGen.findFirst({
      where: {
        uniqueId: String(req.body.id),
      },
    });

    post.email = client?.userEmail;
    post.rating = Number(req.body.rating);
    post.companyName = client?.companyName;

    if (req.body.clientName) {
      post.clientName = req.body.clientName;
    }
    if (req.body.method) {
      post.method = req.body.method;
    }
    if (req.body.clientMessage) {
      post.private = req.body.clientMessage;
    }
    await prisma.client.create({
      data: post,
    });
    return res.status(200).json({
      success: true,
      message: 'Your review post has been submitted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};
// qr code generatin
const createClientLink = async (req: Request, res: Response) => {
  try {
    if (req.user?.email && req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      let data: any = {};

      if (req.body.googleLink) {
        data.googleLink = req.body.googleLink;
      }
      if (req.body.facebookLink) {
        data.facebookLink = req.body.facebookLink;
      }
      await prisma.qrCodeGen.create({
        data: {
          userEmail: req.user.email,
          companyLogo: imageUrl,
          companyName: req.body.companyName,
          uniqueId: uniqid(),
          ...data,
        },
      });

      return res.status(200).json({
        success: true,
        message: 'The link  has been successfully created.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Error creating user',
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const getClientLink = async (req: Request, res: Response) => {
  try {
    if (req.user?.email) {
      const isUniquedId = await prisma.qrCodeGen.findMany({
        where: {
          userEmail: req.user.email,
        },
        select: {
          uniqueId: true,
          companyName: true,
        },
      });

      return res.status(200).json({
        data: isUniquedId,
        success: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Error user get link for review',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};
const deleteClientLink = async (req: Request, res: Response) => {
  try {
    const user = await prisma.qrCodeGen.findFirst({
      where: { uniqueId: req.body.uniqueId },
    });
    if (!user) {
      return res.status(200).json({
        message: 'user not found',
        success: false,
      });
    }
    await prisma.qrCodeGen.delete({
      where: {
        id: user?.id, // Convert uniqueId to string
      },
    });
    await cloudinary.v2.uploader.destroy(user.companyLogo);
    return res.status(200).json({
      message: 'Link was successfully deleted',
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const getReviewLogo = async (req: Request, res: Response) => {
  try {
    if (req.query.uniqueId && Number(req.query.uniqueId) !== 0) {
      const isUniquedId = await prisma.qrCodeGen.findFirst({
        where: {
          uniqueId: String(req.query.uniqueId),
        },
        select: {
          companyLogo: true,
          facebookLink: true,
          googleLink: true,
        },
      });

      return res.status(200).json({
        data: isUniquedId,
        success: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Error user get link for review',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file as Express.Multer.File;
  const base64Image = Buffer.from(image.buffer).toString('base64');
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getClient,
  createClient,
  createClientLink,
  getClientLink,
  deleteClientLink,
  getReviewLogo,
};
