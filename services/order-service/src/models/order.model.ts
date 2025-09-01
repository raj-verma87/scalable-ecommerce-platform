import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    userId: string,
    products: {
        productId: string,
        quantity: number
    }[],
    totalAmount: number,
    status: 'PENDING' | 'PAID' | 'SHIPPED' | 'CANCELLED',
    createdAt: Date,
    updatedAt: Date

}

const orderSchema = new Schema<IOrder>({
    userId: {type: String, required: true},
    products: [
        {
            productId: {type:String, required: true},
            quantity: {type: Number, required: true, min: 1}
        }   
    ],
    totalAmount: {type: Number, required: true},
    status:{
        type: String,
        enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'],
        default: 'PENDING'
    }
},{timestamps: true}
);

export default mongoose.model<IOrder>('Order',orderSchema);
