const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: Number,
    gender: String,
    dateOfBirth: Date,
    height: Number,   // cm
    weight: Number,   // kg
    bloodGroup: String,
    medicalHistory: [String],
    allergies: [String],
    smokingStatus: { type: String, enum: ["never", "former", "current"], default: "never" },
    exerciseLevel: { type: String, enum: ["sedentary", "light", "moderate", "active"], default: "sedentary" },
    dietType: { type: String, enum: ["poor", "average", "good", "excellent"], default: "average" },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);