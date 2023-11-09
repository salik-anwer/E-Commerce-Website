import express from "express";
import { validationResult } from "express-validator"; // used to store validation result for error handling //
import { checkUserEmail, checkUserPassword, validateUserEmail, validateUserPassword, validateUserPasswordConfirm } from "./validation.js";
// import the validation chains from validation.js to be used here //
import User from "../models/users.js";
import crypto from "crypto";
import util from "util";

// works like const app = express(); //
const router = express.Router(); // sub-router object to use in the get and post here and link up to the "router" object in index.js //

const scrypt = util.promisify(crypto.scrypt); // promisify crypto.scrypt as scrypt //

router.get("/user/signup", (req, res) => {
    res.render("./users/signup.ejs");  // render the ejs file for signup page //
    // path relative to views folder as res.render takes views as default current directory //
});
// pass in the validation chains as array in post request to validate the form entries(syntax of express-validator) //
router.post("/user/signup", [ validateUserEmail, validateUserPassword, validateUserPasswordConfirm ], async (req, res) => {
    const errors = validationResult(req); //store the validation result //
    // extract error message for all three form entries //
    const emError = errors.mapped()["email"]?.msg;
    const pwError = errors.mapped()["password"]?.msg;
    const pwCError = errors.mapped()["passwordConfirm"]?.msg;

    if(!errors.isEmpty()) return res.render("./users/signup.ejs", { errorEmail: emError, errorPassword: pwError, errorPasswordConfirm: pwCError });
    // pass error msgs into ejs file to render //
    const { email, password } = req.body;
    const salt = crypto.randomBytes(8).toString("hex"); // generate salt //
    const hashedbufferPw = await scrypt(password, salt, 64); // 64 is the block size //
    // promisified version of scrypt, hashedbufferPw stores the hashed salted pw as a buffer in hex //
                                        // pw = "hashedSaltedPW.salt" //
    await User.create({email: email, password: `${hashedbufferPw.toString("hex")}.${salt}`});
    const record = await User.findOne( { email: email } ).exec();
    req.session.userId = record._id;
    // req.session obj added to req by cookie-session, any info we add to it will be maintained by session //
    // here, will contain the encryption key along with user id from userRepo, stored in userId//
    res.redirect("/");
});

router.get("/user/login", (req, res) => {
    res.render("./users/login.ejs");
});

router.post("/user/login", [ checkUserEmail, checkUserPassword ], async (req, res) => {
    const errors = validationResult(req); //store the validation result //
    // extract error message for all form entries //
    const emError = errors.mapped()["email"]?.msg;
    const pwError = errors.mapped()["password"]?.msg;

    if(!errors.isEmpty()) return res.render("./users/login.ejs", { errorEmail: emError, errorPassword: pwError });
    // pass error msgs into ejs file to render //
    const { email } = req.body;
    const record = await User.findOne( { email: email } ).exec();
    req.session.userId = record._id;
    res.redirect("/");
});

router.get("/user/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

export default router; // export router to import in index.js and link up to app //