import express from "express";
import Product from "../models/products.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const prods = await Product.find().exec();
    res.render("./products/index.ejs", { products: prods, id: req.session.userId, isCart: false } );
});

export default router;
