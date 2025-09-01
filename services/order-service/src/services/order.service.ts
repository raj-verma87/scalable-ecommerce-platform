import Order, {IOrder} from '../models/order.model';
import mongoose from 'mongoose';

export const createOrder = async (userId: string, products: any[], totalAmount: number): Promise<IOrder> => {
    const order = new Order({userId, products, totalAmount});
    return order.save();
}

export const getOrdersByUser = async (userId: string): Promise<IOrder[]> => {
    return Order.find({userId}).sort({createdAt: -1});
};

export const getOrderById = async (orderId: string): Promise<IOrder | null> => {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return null;
    }
    return Order.findById(orderId);
}

export const updateOrderStatus = async (orderId: string, status: IOrder['status']): Promise<IOrder | null> => {
   return Order.findByIdAndUpdate (orderId,{status}, {new: true});
}



