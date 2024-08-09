import mongoose from "mongoose";

const categorySchema = mongoose.Schema({}, { timestamps: true });

export const category = mongoose.model("category", categorySchema);
