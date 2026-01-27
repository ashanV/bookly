import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    position: { type: String },
    phone: { type: String },
    email: { type: String },
    bio: { type: String },
    avatar: { type: String },
    avatarImage: { type: String },
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee', 'calendar-only', 'no-access'],
        default: 'employee'
    },
    assignedServices: [{
        serviceId: { type: String },
        duration: { type: Number },
        price: { type: Number },
        available: { type: Boolean, default: true }
    }],
    availability: {
        monday: { open: String, close: String, closed: Boolean },
        tuesday: { open: String, close: String, closed: Boolean },
        wednesday: { open: String, close: String, closed: Boolean },
        thursday: { open: String, close: String, closed: Boolean },
        friday: { open: String, close: String, closed: Boolean },
        saturday: { open: String, close: String, closed: Boolean },
        sunday: { open: String, close: String, closed: Boolean }
    },
    vacations: [{
        id: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        reason: { type: String }
    }],
    breaks: [{
        id: { type: String },
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String },
        reason: { type: String }
    }]
});

export default EmployeeSchema;
