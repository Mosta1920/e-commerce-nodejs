import { checkProductInCart } from "./check-product-in-cart.js";
import { calculateSubTotal } from "./calculate-subtotal.js";

export async function updateProductQuantity(userCart, productId, quantity) {
  const isProductExistInCart = await checkProductInCart(userCart, productId);
  if (!isProductExistInCart) return null;

  userCart?.products.forEach((product) => {
    if (product.productId.toString() === productId) {
      product.quantity = quantity;
      product.finalPrice = product.basePrice * quantity;
    }
  });


  userCart.subTotal =  calculateSubTotal(userCart.products);

  return await userCart.save();
}
