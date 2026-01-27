import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true, index: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: { type: String, default: 'Ogólne', index: true },
    employees: [{ type: Number }]
});

export default ServiceSchema;
