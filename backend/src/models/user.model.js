import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
      unique: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true } // cratedAt and updatedAt by default
);

export const User = mongoose.model("User", userSchema);
