import jwt, { Secret, VerifyCallback } from 'jsonwebtoken';

interface JwtValue {
  id?: string | number | undefined;
  fullName?: string;
  email?: string;
  phone?: string;
  userStatus?: string;
  role?: string;
}

export const jwtSign = (token: JwtValue) => {
  return jwt.sign(token, process.env.VERIFY_SIGNATURE as Secret, {
    expiresIn: '2h',
  });
};

// Function to verify a JWT token
export const jwtVerify = async (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.VERIFY_SIGNATURE as Secret
    ) as JwtValue;

    return {
      success: true,
      data: decoded,
    };
  } catch (error) {
    return {
      tokenInvalid: true,
      success: false,
      message: 'Invalid token',
    };
  }
};
