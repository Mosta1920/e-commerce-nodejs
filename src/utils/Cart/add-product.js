import { calculateSubTotal } from "./calculate-subtotal.js";

export async function addProduct(userCart, product, quantity) {
  userCart?.products.push({
    productId: product._id,
    quantity: quantity,
    basePrice: product.appliedPrice,
    title: product.title,
    finalPrice: product.appliedPrice * quantity,
  });

  userCart.subTotal = calculateSubTotal(userCart.products);

  return await userCart.save();
}
