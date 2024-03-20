import Cart from "../../../DB/Models/cart.model.js";
import { checkProductAvailability } from "../../utils/Cart/check-product-availability.js";
import { checkCart } from "../../utils/Cart/check-cart.js";
import { addCart } from "../../utils/Cart/add-cart.js";
import { updateProductQuantity } from "../../utils/Cart/update-product-quantity.js";
import { addProduct } from "../../utils/Cart/add-product.js";
import { calculateSubTotal } from "../../utils/Cart/calculate-subtotal.js";

//===============================================  Add to Cart ===============================================//

/**
 * destructuring the required data from the request body
 * check if the product exist and available
 * check if logggedIn user already have cart
 * add product to cart
 * update product quantity
 * return the response
 */

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const { _id } = req.authUser;

  // check if the product exist and available
  const product = await checkProductAvailability(productId, quantity);
  if (!product)
    return res
      .status(404)
      .json({ message: "Product not found or out of stock" });

  // check if logggedIn user already have cart
  const userCart = await checkCart(_id);

  if (!userCart) {
    const newCart = await addCart(_id, product, quantity);
    return res
      .status(200)
      .json({ message: "Product added to cart Successfully", data: newCart });
  }

  const isUpdated = await updateProductQuantity(userCart, productId, quantity);
  if (!isUpdated) {
    const added = await addProduct(userCart, product, quantity);
    if (!added)
      return res.status(400).json({ message: "Product not added to cart" });
  }

  res
    .status(200)
    .json({ message: "Product added to cart Successfully", data: userCart });
};

//===============================================  Remove from Cart  ===============================================//

/**
 * destructuring the required data from the request body
 * check if logggedIn user already have cart
 * remove product from cart
 * return the response
 */
export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const { _id } = req.authUser;

  const userCart = await Cart.findOne({
    userId: _id,
    "products.productId": productId,
  });
  if (!userCart)
    return next({ message: "Product not found in cart", cause: 404 });

  userCart.products = userCart.products.filter(
    (product) => product.productId.toString() !== productId
  );
  userCart.subTotal = calculateSubTotal(userCart.products);

  const newCart = await userCart.save();

  if (newCart.products.length === 0) {
    await Cart.findByIdAndDelete(newCart._id);
  }

  res.status(201).json({ message: "Product delete to cart successfully" });
};
