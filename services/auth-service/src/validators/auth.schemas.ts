// services/auth-service/src/validators/auth.schemas.ts
import Joi from '@shared/validators/customJoi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .message(
        'Password must contain at least one uppercase letter, one number, and one special character'
      )
      .required(),
    role: Joi.string().valid('USER', 'ADMIN').default('USER'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
      .message(
        'New password must contain at least one uppercase letter, one number, and one special character'
      )
      .required(),
  }),
};
