import Joi from './customJoi';

export const userSchemas = {
  create: Joi.object({
    authUserId: Joi.string().required(),
    name: Joi.string().allow('').optional(),
    address: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    role: Joi.string().valid('USER', 'ADMIN').default('USER'),
  }),

  updateProfile: Joi.object({
    name: Joi.string().allow('').optional(),
    address: Joi.string().allow('').optional(),
    phone: Joi.string().allow('').optional(),
    role: Joi.string().valid('USER', 'ADMIN').optional(),
  }),
};

export const productSchemas = {
  create: Joi.object({
    name: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).default(0),
    category: Joi.string().max(50).required(),
    createdBy: Joi.string().required(),
  }),

  update: Joi.object({
    name: Joi.string().max(100).optional(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().optional(),
    stock: Joi.number().integer().min(0).optional(),
    category: Joi.string().max(50).optional(),
  }),
};

export const paginationSchemas = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
};
