import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cartItems: [
        {
          _id: mongoose.Types.ObjectId, // Custom id or use the default ObjectId
          quantity: Number,
        },
      ],
});

const userModel = mongoose.model("User", userSchema);
export default userModel;