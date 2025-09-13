import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:5003';

export const validateProductExists = async (productId: string) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`, {
      timeout: 5000, // fail fast if service is unreachable
    });
    return response.data;
  }catch (error: any) {
    if (error.response) {
      console.error(`Product validation failed: ${error.response.status}`);
      if (error.response.status === 404) return null;
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to Product Service');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Product Service request timed out');
    } else {
      console.error('Unknown error while calling Product Service', error.message);
    }
    throw new Error('Error communicating with Product Service');
  }
};
