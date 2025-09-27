import Joi from '@shared/validators/customJoi';
import { userSchemas } from '@shared/validators';

export const userServiceSchemas = {
  create: userSchemas.create,
  updateProfile: userSchemas.updateProfile.keys({
    isActive: Joi.boolean().optional(),
  }),
};
