import Cart, { ICart } from '../models/cart.model';

export const getCartByUser = async (userId: string): Promise<ICart | null> => {
  return Cart.findOne({ userId });
};

export const addItemToCart = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart> => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ productId, quantity }] });
  } else {
    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  }

  return cart.save();
};

export const updateItemQuantity = async (
  userId: string,
  productId: string,
  quantity: number
): Promise<ICart | null> => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  const itemIndex = cart.items.findIndex((item) => item.productId === productId);
  if (itemIndex === -1) return null;

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  return cart.save();
};

export const clearCart = async (userId: string): Promise<ICart | null> => {
  return Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
};
