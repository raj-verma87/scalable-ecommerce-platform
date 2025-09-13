import { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { JwtPayload } from '../types';
import { validateProductExists } from '../utils/productClient';


export const getCart = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const userId = (user as any)?.id || (req.headers['x-user-id'] as string);
    const cart = await cartService.getCartByUser(userId);
    res.json(cart || { userId: userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart', error: err });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const { productId, quantity } = req.body;

    const product = await validateProductExists(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userId = (user as any)?.id || (req.headers['x-user-id'] as string);
    const cart = await cartService.addItemToCart(userId, productId, quantity);
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart', error: err });
  }
};

export const updateQuantity = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const { productId, quantity } = req.body;

    const product = await validateProductExists(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const userId = (user as any)?.id || (req.headers['x-user-id'] as string);
    const cart = await cartService.updateItemQuantity(userId, productId, quantity);
    if (!cart) return res.status(404).json({ message: 'Item not found in cart' });
    res.json(cart);
  } catch (err:any) {
    res.status(500).json({ message: 'Error updating cart', error: err.message || 'Unknown error' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const user = (req.user as JwtPayload) || ({} as JwtPayload);
    const userId = (user as any)?.id || (req.headers['x-user-id'] as string);
    const cart = await cartService.clearCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err });
  }
};
