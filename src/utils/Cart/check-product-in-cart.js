export async function checkProductInCart(cart, productId) {
  return cart.products.some(
    (product) => product.productId.toString() === productId
  );
}
