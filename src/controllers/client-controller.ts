import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const getClient = async (req: Request, res: Response) => {
  const { token: authorization } = req.headers;
  //@ts-ignore
  const token = authorization.split(' ')[1];

  try {
    // cookie identity
    const searchClientName = (req.query.clientName as string) || '';
    const searchMethod = (req.query.method as string) || '';

    const page = parseInt(req.query.page as string) || 1;
    console.log(req.query.page);

    try {
      const secret = process.env.VERIFY_SIGNATURE as string;
      let payload = jwt.verify(String(token), secret) as jwt.JwtPayload;

      let where: any = {
        email: payload.email,
      };
      const total = await prisma.client.count({
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

      if (searchMethod) {
        where.method = {
          contains: searchMethod,
        };
      }
      if (searchClientName) {
        where.clientName = {
          contains: searchClientName,
        };
      }
      const pageSize = 10;
      const skip = (page - 1) * pageSize;
      const client = await prisma.client.findMany({
        where,
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
const createClient = async (req: Request, res: Response) => {
  try {
    if (!req.body.id) {
      return res.status(200).json({
        success: false,
        message: 'client ID not valid',
      });
    }
    let post: any = {};

    let client = await prisma.user.findFirst({
      where: {
        uniqueId: Number(req.body.id),
      },
    });

    post.email = client?.email;
    post.rating = Number(req.body.rating);

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
    if (req.user?.email && req.body.uniqueId) {
      await prisma.user.update({
        where: {
          email: req.user.email,
        },

        data: {
          uniqueId: Number(req.body.uniqueId),
        },
      });

      return res.status(200).json({
        success: true,
        message: 'The link for your review has been successfully created.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Error creating user',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
    });
  }
};
const getClientLink = async (req: Request, res: Response) => {
  try {
    if (req.user?.email) {
      const isUniquedId = await prisma.user.findFirst({
        where: {
          email: req.user.email,
        },
        select: {
          uniqueId: true,
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
    const user = await prisma.user.findFirst({
      where: {
        uniqueId: req.body.uniqueId,
      },
      select: {
        id: true, // Assuming 'id' is the standard unique identifier
      },
    });

    if (user) {
      // If the user exists, use their standard unique identifier to delete them
      await prisma.user.update({
        where: {
          id: user.id, // Use the standard unique identifier ('id') for deletion
        },
        data: {
          uniqueId: 0,
        },
      });
      return res.status(200).json({
        message: 'Link was successfully deleted',
        success: true,
      });
    } else {
      return res.status(200).json({
        message: 'Link was not found',
        success: true,
      });
      // Handle the case where the user does not exist
    }
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
      const isUniquedId = await prisma.user.findFirst({
        where: {
          uniqueId: Number(req.query.uniqueId),
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

export default {
  getClient,
  createClient,
  createClientLink,
  getClientLink,
  deleteClientLink,
  getReviewLogo,
};
