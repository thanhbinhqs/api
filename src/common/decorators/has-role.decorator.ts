import { SetMetadata } from '@nestjs/common';

export const HAS_ROLE_KEY = 'has_role';

export const HasRole = (role: string) => {
  return SetMetadata(HAS_ROLE_KEY, role);
};
