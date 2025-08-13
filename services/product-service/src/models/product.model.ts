import mongoose, {Document, Schema} from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  createdBy: string;
}

const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, required: true },
    createdBy: { type: String, required: true }
},
{timestamps: true}
);

export default mongoose.model<IProduct>('Product',productSchema);

