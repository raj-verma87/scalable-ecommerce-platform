import  {Request, Response} from 'express';
import * as orderService from '../services/order.service';
import { JwtPayload } from 'jsonwebtoken';

export const createOrder = async (req: Request, res: Response)=>{
    try{
        const user = req.user as JwtPayload;
        const {products, totalAmount} = req.body;

        const order = await orderService.createOrder(user.id, products, totalAmount);
        res.status(201).json(order);
    }
    catch(err){
        res.status(500).json({ message: 'Error creating order', error: err });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const user = req.user as JwtPayload;
    const orders = await orderService.getOrdersByUser(user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching order', error: err });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user as JwtPayload;

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status);
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err });
  }
};
