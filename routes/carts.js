import express from "express";
import Product from "../models/products.js";
import User from "../models/users.js";

const router = express.Router();

//receive post to add to cart
router.post("/cart/add/:id", async (req, res) => {
    if(!req.session.userId) return res.redirect("/user/login");
    
    const user = await User.findById(req.session.userId);
    const cartItem = user.cartItems.find(item => item._id.toString() === req.params.id);

    if(!cartItem) user.cartItems.push( { _id: req.params.id, quantity: 1 } );
    else cartItem.quantity++;

    await User.findByIdAndUpdate(req.session.userId, { cartItems: user.cartItems }).exec();
    res.redirect("/");
});

//receive get to view cart 
router.get("/cart", async (req, res) => {
    if(!req.session.userId) return res.redirect("/user/login");
    const user = await User.findById(req.session.userId);

    if(!user.cartItems) return res.send("Cart is empty.");
    const cartItems = user.cartItems;

    for(let cartItem of cartItems) {
        const prod = await Product.findById(cartItem._id).exec();
        cartItem.product = prod;
    }

    res.render("../views/users/cart.ejs", { items: cartItems, isCart: true });
});

//receive post to del from cart
router.post("/cart/delete/:id", async (req, res) => {
    const user = await User.findById(req.session.userId).exec();
    const leftItems = user.cartItems.filter(item => item._id.toString() !== req.params.id); 
    user.cartItems = leftItems;
    await User.findByIdAndUpdate(req.session.userId, user).exec();
    res.redirect("/cart");
});

export default router;