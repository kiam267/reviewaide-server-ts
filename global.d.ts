import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: UserType; // Change 'any' to the type of your user object if known
    }
  }
}

enum UserStatus {
  pending = 'pending',
  active = 'active',
  deactivated = 'deactivated',
}

// Define an interface for the User object
export interface UserType {
  id?: string;
  fullName?: string;
  email: string;
  phone?: string;
  userStatus?: UserStatus | undefined;
}
declare function jwtSign<T>(user: T): string;
