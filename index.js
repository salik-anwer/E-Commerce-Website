import express from "express";
import bodyParser from "body-parser";
import cookieSession from "cookie-session";
import mongoose from "mongoose";
import adminAuthRouter from "./routes/admin/auth.js"; // imported subrouter as "authRouter" // 
// in es6 modules, it is important to add extension of file importing from, or gives error //
import adminProdRouter from "./routes/admin/products.js";
import prodRouter from "./routes/products.js";
import cartRouter from "./routes/carts.js";
import userAuthRouter from "./routes/users.js";
import serverless from "serverless-http";

const app = express();
const port = 3000;
const uri = 'mongodb://0.0.0.0:27017/ecomDB';

mongoose.connect(uri);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database connected."));

app.use(express.static("public")); // to access all static files like css stylesheet // all static file addresses written relative to public folder //
app.use(bodyParser.urlencoded({ extended: true }) );
app.use(cookieSession({ keys: ["xn73cq021hdy1022slk#1dyxsn1$"] }) ); //keys is the encryption key for the user cookie//
app.use(adminAuthRouter); // access to all route handlers in the file auth.js //
app.use(adminProdRouter);
app.use(prodRouter);
app.use(cartRouter);
app.use(userAuthRouter);

app.listen(port, () => {
    console.log("Server running on port 3000");
});






