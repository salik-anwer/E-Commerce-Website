import { check } from "express-validator"; // middleware to check form entries for validation //
import { fileTypeFromBuffer } from "file-type"; //middleware to check file extension //
import Admin from "../models/admins.js";
import User from "../models/users.js";
import crypto from "crypto";
import util from "util";

const scrypt = util.promisify(crypto.scrypt); // promisify crypto.scrypt as scrypt //

//validators for admin signup//
    export const validateEmail = check("email").trim().normalizeEmail().isEmail().withMessage("Invalid E-mail.").custom(async (value, {req}) => {
        const existingUser = await Admin.findOne( { email: req.body.email } ).exec();
        if(existingUser) throw new Error("E-mail already exists.");
        else return true;
        });

    export const validatePassword = check("password").trim().isLength({min:5, max:25}).withMessage("Password must be 5-25 characters.");

    export const validatepasswordConfirm = check("passwordConfirm").trim().custom((value, {req}) => {
        if(req.body.passwordConfirm !== req.body.password) throw new Error("Passwords must match.");
        else return true;
        });
    
//validators for admin login//
    export const checkEmail = check("email").trim().normalizeEmail().isEmail().withMessage("Invalid E-mail.").custom(async (value, {req}) => {
        const userAccount = await Admin.findOne( { email: req.body.email } ).exec();
    
        if(!userAccount) throw new Error("No registered user with given e-mail.");
        else return true;
        });
    
    export const checkPassword = check("password").trim().custom(async (value, {req}) => {
        const userAccount = await Admin.findOne( { email: req.body.email } ).exec();
        if(!userAccount) throw new Error("Incorrect password.");
    
        const givenPw = req.body.password;
    
        const [hashedPw, salt] = userAccount.password.split("."); // array destructured into two consts // not creating new array //
        const givenhashedbufferPw = await scrypt(givenPw, salt, 64);
        if(hashedPw !== givenhashedbufferPw.toString("hex")) throw new Error("Incorrect password.");
        else return true;
        });

//validators for user signup//
    export const validateUserEmail = check("email").trim().normalizeEmail().isEmail().withMessage("Invalid E-mail.").custom(async (value, {req}) => {
        const existingUser = await User.findOne( { email: req.body.email } ).exec();
        if(existingUser) throw new Error("E-mail already exists.");
        else return true;
        });
    
    export const validateUserPassword = check("password").trim().isLength({min:5, max:25}).withMessage("Password must be 5-25 characters.");
    
    export const validateUserPasswordConfirm = check("passwordConfirm").trim().custom((value, {req}) => {
        if(req.body.passwordConfirm !== req.body.password) throw new Error("Passwords must match.");
        else return true;
        });

//validators for user login//
    export const checkUserEmail = check("email").trim().normalizeEmail().isEmail().withMessage("Invalid E-mail.").custom(async (value, {req}) => {
        const userAccount = await User.findOne( { email: req.body.email } ).exec();

        if(!userAccount) throw new Error("No registered user with given e-mail.");
        else return true;
        });

    export const checkUserPassword = check("password").trim().custom(async (value, {req}) => {
        const userAccount = await User.findOne( { email: req.body.email } ).exec();
        if(!userAccount) throw new Error("Incorrect password.");

        const givenPw = req.body.password;

        const [hashedPw, salt] = userAccount.password.split("."); // array destructured into two consts // not creating new array //
        const givenhashedbufferPw = await scrypt(givenPw, salt, 64);
        if(hashedPw !== givenhashedbufferPw.toString("hex")) throw new Error("Incorrect password.");
        else return true;
        });

// validators for new product //    
    export const checkName = check("name").trim().isLength({min: 3, max: 25}).withMessage("Re-enter name within 3-25 characters.");

    export const checkPrice = check("price").trim().toFloat().isFloat({min: 1}).withMessage("Please enter a valid price.");

    export const checkImage = check("image").custom(async (value, {req}) => {
        if(!req.file) throw new Error("Please attach product image.");
        const filetype = await fileTypeFromBuffer(req.file.buffer);
        const acceptableFileTypes = ["png", "jpg", "jpeg"];
        if (!acceptableFileTypes.includes(filetype["ext"])) throw new Error("Please attach PNG or JPEG file.");
        else return true;
    });

    export const checkNewImage = check("image").custom(async (value, {req}) => {
        if(!req.file) return true;
        const filetype = await fileTypeFromBuffer(req.file.buffer);
        const acceptableFileTypes = ["png", "jpg", "jpeg"];
        if (!acceptableFileTypes.includes(filetype["ext"])) throw new Error("Please attach PNG or JPEG file.");
        else return true;
    });

    // export all validators //