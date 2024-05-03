import bcrypt from 'bcrypt';


export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string 
) => { 

  const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
  return isPasswordMatch;
}
