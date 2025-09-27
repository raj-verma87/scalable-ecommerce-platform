// services/shared/src/validators/customJoi.ts
import JoiBase from 'joi';
import mongoose from 'mongoose';

const Joi = JoiBase.extend((joi) => ({
  type: 'objectId',
  base: joi.string(),
  messages: {
    'objectId.base': '"{{#label}}" must be a valid ObjectId',
  },
  validate(value, helpers) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error('objectId.base') };
    }
  },
}));

export default Joi;
