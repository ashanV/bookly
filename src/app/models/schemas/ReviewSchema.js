import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    service: { type: String },
    verified: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false }
});

export default ReviewSchema;
