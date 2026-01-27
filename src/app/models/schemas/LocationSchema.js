import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    businessType: { type: String },
    additionalTypes: [{ type: String }],
    address: {
        street: { type: String },
        apartmentNumber: { type: String },
        district: { type: String },
        city: { type: String },
        region: { type: String },
        province: { type: String },
        postCode: { type: String },
        country: { type: String, default: 'Polska' }
    },
    billingAddress: {
        street: { type: String },
        apartmentNumber: { type: String },
        district: { type: String },
        city: { type: String },
        region: { type: String },
        province: { type: String },
        postCode: { type: String },
        country: { type: String, default: 'Polska' }
    },
    workingHours: {
        monday: {
            open: String, close: String, closed: { type: Boolean, default: false },
            ranges: [{ open: String, close: String }]
        },
        tuesday: {
            open: String, close: String, closed: { type: Boolean, default: false },
            ranges: [{ open: String, close: String }]
        },
        wednesday: {
            open: String, close: String, closed: { type: Boolean, default: false },
            ranges: [{ open: String, close: String }]
        },
        thursday: {
            open: String, close: String, closed: { type: Boolean, default: false },
            ranges: [{ open: String, close: String }]
        },
        friday: {
            open: String, close: String, closed: { type: Boolean, default: false },
            ranges: [{ open: String, close: String }]
        },
        saturday: {
            open: String, close: String, closed: { type: Boolean, default: true },
            ranges: [{ open: String, close: String }]
        },
        sunday: {
            open: String, close: String, closed: { type: Boolean, default: true },
            ranges: [{ open: String, close: String }]
        }
    },
    noAddress: { type: Boolean, default: false },
    isPrimary: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default LocationSchema;
