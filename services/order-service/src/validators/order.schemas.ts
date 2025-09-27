// services/order-service/src/validators/order.schemas.ts
import Joi from '@shared/validators/customJoi';

export const orderSchemas = {
  createOrder: Joi.object({
    userId: Joi.objectId().optional(),
    products: Joi.array()
      .items(
        Joi.object({
          productId: Joi.objectId().required(),
          quantity: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required(),
    totalAmount: Joi.number().positive().required(),
    status: Joi.string()
      .valid('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')
      .default('PENDING'),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')
      .required(),
  }),
};
