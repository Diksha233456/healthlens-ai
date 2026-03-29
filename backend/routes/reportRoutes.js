const express = require("express");
const LabReport = require("../models/LabReport");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add new lab report
router.post("/", authMiddleware, async (req, res) => {
    try {
        const report = new LabReport({ ...req.body, userId: req.userId });
        await report.save();
        res.status(201).json({ message: "Report added successfully", report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Seed sample lab reports for new users
router.post("/seed", authMiddleware, async (req, res) => {
    try {
        const existingCount = await LabReport.countDocuments({ userId: req.userId });
        if (existingCount > 0) {
            return res.status(400).json({ message: "Account already has data. Cannot seed." });
        }

        const today = new Date();
        const pastDate = new Date();
        pastDate.setMonth(today.getMonth() - 6);

        const reports = [
            {
                userId: req.userId,
                labName: "Demo Lab (Past)",
                date: pastDate,
                glucose: 105,
                cholesterol: 210,
                ldl: 140,
                hdl: 45,
                hemoglobin: 13.5,
                systolicBP: 130,
                diastolicBP: 85
            },
            {
                userId: req.userId,
                labName: "Demo Lab (Recent)",
                date: today,
                glucose: 92,
                cholesterol: 185,
                ldl: 110,
                hdl: 55,
                hemoglobin: 14.2,
                systolicBP: 118,
                diastolicBP: 78
            }
        ];

        await LabReport.insertMany(reports);
        res.status(201).json({ message: "Successfully seeded demo lab reports." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all reports for user (sorted by date)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const reports = await LabReport.find({ userId: req.userId }).sort({ date: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get summary stats (for dashboard) — MUST be before /:id to avoid route shadowing
router.get("/stats/summary", authMiddleware, async (req, res) => {
    try {
        const reports = await LabReport.find({ userId: req.userId }).sort({ date: 1 });
        if (reports.length === 0) return res.json({ message: "No reports yet", count: 0 });

        const latest = reports[reports.length - 1];
        const prev = reports.length > 1 ? reports[reports.length - 2] : null;

        const trend = (field) => {
            if (!prev || !latest[field] || !prev[field]) return "stable";
            const diff = latest[field] - prev[field];
            if (diff > 5) return "rising";
            if (diff < -5) return "falling";
            return "stable";
        };

        res.json({
            count: reports.length,
            latest,
            trends: {
                glucose: trend("glucose"),
                cholesterol: trend("cholesterol"),
                hdl: trend("hdl"),
                ldl: trend("ldl"),
                hemoglobin: trend("hemoglobin"),
                systolicBP: trend("systolicBP"),
                bmi: trend("bmi"),
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reports/compare — compare latest two reports
router.get("/compare", authMiddleware, async (req, res) => {
    try {
        const reports = await LabReport.find({ userId: req.userId }).sort({ date: -1 }).limit(2);
        if (reports.length < 2) {
            return res.json({ message: "Need at least 2 reports to compare", canCompare: false });
        }

        const [latest, previous] = reports;
        const FIELDS = [
            { key: "glucose", label: "Glucose", unit: "mg/dL", normalMin: 70, normalMax: 99, lowerIsBetter: true },
            { key: "cholesterol", label: "Cholesterol", unit: "mg/dL", normalMin: 0, normalMax: 200, lowerIsBetter: true },
            { key: "ldl", label: "LDL", unit: "mg/dL", normalMin: 0, normalMax: 100, lowerIsBetter: true },
            { key: "hdl", label: "HDL", unit: "mg/dL", normalMin: 40, normalMax: 999, lowerIsBetter: false },
            { key: "triglycerides", label: "Triglycerides", unit: "mg/dL", normalMin: 0, normalMax: 150, lowerIsBetter: true },
            { key: "hemoglobin", label: "Hemoglobin", unit: "g/dL", normalMin: 12, normalMax: 17.5, lowerIsBetter: false },
            { key: "systolicBP", label: "Systolic BP", unit: "mmHg", normalMin: 0, normalMax: 120, lowerIsBetter: true },
            { key: "diastolicBP", label: "Diastolic BP", unit: "mmHg", normalMin: 0, normalMax: 80, lowerIsBetter: true },
            { key: "hba1c", label: "HbA1c", unit: "%", normalMin: 0, normalMax: 5.7, lowerIsBetter: true },
            { key: "bmi", label: "BMI", unit: "", normalMin: 18.5, normalMax: 24.9, lowerIsBetter: false },
            { key: "creatinine", label: "Creatinine", unit: "mg/dL", normalMin: 0.7, normalMax: 1.3, lowerIsBetter: true },
            { key: "tsh", label: "TSH", unit: "mIU/L", normalMin: 0.4, normalMax: 4.0, lowerIsBetter: false },
            { key: "vitaminD", label: "Vitamin D", unit: "ng/mL", normalMin: 20, normalMax: 50, lowerIsBetter: false },
            { key: "vitaminB12", label: "Vitamin B12", unit: "pg/mL", normalMin: 200, normalMax: 900, lowerIsBetter: false },
        ];

        const comparison = FIELDS
            .filter(f => latest[f.key] != null || previous[f.key] != null)
            .map(f => {
                const latestVal = latest[f.key];
                const prevVal = previous[f.key];
                const diff = (latestVal != null && prevVal != null) ? latestVal - prevVal : null;
                const pctChange = (diff != null && prevVal) ? ((diff / prevVal) * 100).toFixed(1) : null;

                let status = "unchanged";
                if (diff !== null) {
                    const improved = f.lowerIsBetter ? diff < 0 : diff > 0;
                    const worsened = f.lowerIsBetter ? diff > 0 : diff < 0;
                    if (Math.abs(diff) < 0.5) status = "unchanged";
                    else if (improved) status = "improved";
                    else if (worsened) status = "worsened";
                }

                const inRange = (val) => val != null ? (val >= f.normalMin && val <= f.normalMax) : null;

                return {
                    ...f,
                    latestValue: latestVal,
                    previousValue: prevVal,
                    diff,
                    pctChange,
                    status,
                    latestInRange: inRange(latestVal),
                    previousInRange: inRange(prevVal),
                };
            });

        const improved = comparison.filter(c => c.status === "improved").length;
        const worsened = comparison.filter(c => c.status === "worsened").length;

        res.json({
            canCompare: true,
            latestDate: latest.date,
            previousDate: previous.date,
            latestLabName: latest.labName,
            previousLabName: previous.labName,
            comparison,
            summary: { improved, worsened, unchanged: comparison.length - improved - worsened }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single report
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const report = await LabReport.findOne({ _id: req.params.id, userId: req.userId });
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update report
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const report = await LabReport.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        );
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.json({ message: "Report updated", report });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete report
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const report = await LabReport.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!report) return res.status(404).json({ message: "Report not found" });
        res.json({ message: "Report deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
