import express from "express";
import multer from "multer"; // middleware to handle multi part form, ie, media upload //
import Product from "../../models/products.js";
import { validationResult } from "express-validator";
import { checkName, checkPrice, checkImage, checkNewImage } from "../validation.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); //

router.get("/admin/products", async (req, res) => {
    if(!req.session.adminId) return res.redirect("/admin/login");
    const prods = await Product.find({}).exec();
    res.render("./admin/products/index.ejs", {products: prods} );
});

router.get("/admin/products/new", (req, res) => {
    if(!req.session.adminId) return res.redirect("/admin/login");
    res.render("./admin/products/newproducts.ejs");
});

// add multer element here to handle media file in image field // also form data is also parsed by the multer element since it is not urlencoded anymore so bodyparser is not working here, hence multer element needs to be added before the validators //
router.post("/admin/products/new", upload.single("image"), [ checkName, checkPrice, checkImage ], async (req, res) => {
    const errors = validationResult(req);
    const nameE = errors.mapped()["name"]?.msg;
    const priceE = errors.mapped()["price"]?.msg;
    const imageE = errors.mapped()["image"]?.msg;

    if(!errors.isEmpty()) return res.render("./admin/products/newproducts.ejs", {nameError: nameE, priceError: priceE, imageError: imageE} );

    const image = req.file.buffer.toString("base64"); // convert image to string in base64 to store with product //
    const { name, price } = req.body;
    await Product.create( { name: name, price: price, image: image } ); 
    res.render("./admin/products/newproducts.ejs", {msg: "Product added to inventory. Check product listing."});
});

router.get("/admin/products/:id/edit", async (req, res) => {
    if(!req.session.adminId) return res.redirect("/admin/login");
    const prod = await Product.findById(req.params.id).exec(); 
    if(!prod) return res.send("No product found.");
    res.render("./admin/products/edit.ejs", {product: prod});
});

router.post("/admin/products/:id/edit", upload.single("image"), [checkName, checkPrice, checkNewImage], async (req, res) => {
    const errors = validationResult(req);
    const nameE = errors.mapped()["name"]?.msg;
    const priceE = errors.mapped()["price"]?.msg;
    const imageE = errors.mapped()["image"]?.msg;
    const prod = await Product.findById(req.params.id).exec(); 

    if(!errors.isEmpty()) return res.render("./admin/products/edit.ejs", {nameError: nameE, priceError: priceE, imageError: imageE, product: prod} );

    const targetRec = await Product.findById(req.params.id).exec();
    const changes = req.body;
    if(req.file) changes.image = req.file.buffer.toString("base64");
    else changes.image = targetRec.image;
    await Product.findByIdAndUpdate(req.params.id, { name: changes.name, price: changes.price, image: changes.image }).exec();
    res.redirect("/admin/products");
});

router.post("/admin/products/:id/delete", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id).exec();
    res.redirect("/admin/products");
});

export default router;

