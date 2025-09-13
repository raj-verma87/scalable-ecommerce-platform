import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  userId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<ICart>('Cart', cartSchema);
