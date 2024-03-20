

import Product from "../../../DB/Models/product.model.js";
import Cart from "../../../DB/Models/cart.model.js";

export async function checkCart(userId) {

    const userCart = await Cart.findOne({ userId });
    return userCart
    
}
