import jwt, { Secret, VerifyCallback } from 'jsonwebtoken';

export const jwtSign = (token: object) => {
  return jwt.sign(token, process.env.VERIFY_SIGNATURE as Secret, {
    expiresIn: '2h',
  });
};

// Function to verify a JWT token
export const jwtVerify = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.VERIFY_SIGNATURE as Secret);

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: 'Invalid token',
    };
  }
};
