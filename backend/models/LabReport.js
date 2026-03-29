const mongoose = require("mongoose");

const labReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },

    // Blood Sugar
    glucose: { type: Number },              // mg/dL (fasting), normal: 70-99
    hba1c: { type: Number },                // %, normal: <5.7

    // Lipid Panel
    cholesterol: { type: Number },          // mg/dL, normal: <200
    hdl: { type: Number },                  // mg/dL, normal: >40 (men), >50 (women)
    ldl: { type: Number },                  // mg/dL, normal: <100
    triglycerides: { type: Number },        // mg/dL, normal: <150

    // Blood Pressure
    systolicBP: { type: Number },           // mmHg, normal: <120
    diastolicBP: { type: Number },          // mmHg, normal: <80

    // Blood Count
    hemoglobin: { type: Number },           // g/dL, men: 13.5-17.5, women: 12-15.5
    wbc: { type: Number },                  // 10^3/μL, normal: 4.5-11
    platelets: { type: Number },            // 10^3/μL, normal: 150-400

    // Kidney
    creatinine: { type: Number },           // mg/dL, normal: 0.7-1.3
    uricAcid: { type: Number },             // mg/dL, normal: 3.5-7.2

    // Liver
    alt: { type: Number },                  // U/L, normal: 7-56
    ast: { type: Number },                  // U/L, normal: 10-40

    // Body
    bmi: { type: Number },
    weight: { type: Number },              // kg

    // Thyroid
    tsh: { type: Number },                  // mIU/L, normal: 0.4-4.0

    // Vitamin
    vitaminD: { type: Number },            // ng/mL, normal: 20-50
    vitaminB12: { type: Number },          // pg/mL, normal: 200-900

    notes: { type: String },
    labName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("LabReport", labReportSchema);
