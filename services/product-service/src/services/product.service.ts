import Product, { IProduct } from '../models/product.model';

export const createProduct = async (data: IProduct) => {
  return await Product.create(data);
};

export const getAllProducts = async () => {
  return await Product.find().select('-__v');
};

export const getProductById = async (id: string) => {
  return await Product.findById(id).select('-__v');
};

export const updateProduct = async (id: string, data: Partial<IProduct>) => {
  return await Product.findByIdAndUpdate(id, data, { new: true }).select('-__v');
};

export const deleteProduct = async (id: string) => {
  return await Product.findByIdAndDelete(id);
};

