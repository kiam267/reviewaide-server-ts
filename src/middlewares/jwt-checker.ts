import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserType } from '../../global';

export const jwtChecker = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token: userToken } = req.headers;


    const authorization: string = userToken as string;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        data: {},
        success: false,
        message: 'Authorization header missing or invalid',
        tokenInvalid: true,
      });
    }
    const token = authorization.split(' ')[1];
    const secret = process.env.VERIFY_SIGNATURE as string;
    const payload = jwt.verify(token, secret) as jwt.JwtPayload; 
    // Optionally, you can attach the payload to the request for further processing
    req.user = payload as UserType;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        data: {},
        success: false,
        message: 'Token expired',
        tokenInvalid: true,
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        data: {},
        success: false,
        message: 'Invalid token',
        tokenInvalid: true,
      });
    } else {
      return res.status(500).json({
        data: {},
        success: false,
        message: 'Internal server error',
        tokenInvalid: true,
      });
    }
  }
};
