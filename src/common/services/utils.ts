import * as bcrypt from 'bcrypt';

export const Utils = {
  //check string is UUID or not
  isUUID: (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      str,
    ),
  hashedPassword: (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },
  comparePassword: (password: string, hash: string) =>
    bcrypt.compareSync(password, hash),
};
