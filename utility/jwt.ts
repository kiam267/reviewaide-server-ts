import jwt, { Secret, VerifyCallback } from 'jsonwebtoken'

export const jwtSign = (token: object) => {
  return jwt.sign(token, process.env.VERIFY_SIGNATURE as Secret, {
    expiresIn: '2h',
  });
};


// Function to verify a JWT token
const verifyToken = (token : string) => {
  try {
    const decoded = jwt.verify(token, process.env.VERIFY_SIGNATURE as Secret );

    // // Check if the token is expired
    // if (decoded.exp < Date.now() / 1000) {
    //   return { valid: false, message: 'Token has expired' };
    // }

    // return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: 'Invalid token' };
  }
};
