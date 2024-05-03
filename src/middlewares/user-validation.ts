import { NextFunction, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const createUserValidation = [
  body('fullName').isString().notEmpty().withMessage('Name must be a string'),
  body('phone').isString().notEmpty().withMessage('phone must be a string '),
  body('email').isString().notEmpty().trim().withMessage('Email must be a string'),
  body('password').isString().notEmpty(),
  handleValidationErrors,
];
