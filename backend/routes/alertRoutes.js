const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const LabReport = require("../models/LabReport");

const router = express.Router();

// Rule-based thresholds for health alerts
const THRESHOLDS = [
    { field: "glucose", label: "Blood Glucose", unit: "mg/dL", high: 110, critical: 126, low: 70, lowLabel: "Low Blood Sugar (Hypoglycemia)" },
    { field: "cholesterol", label: "Total Cholesterol", unit: "mg/dL", high: 200, critical: 240 },
    { field: "ldl", label: "LDL Cholesterol", unit: "mg/dL", high: 130, critical: 160 },
    { field: "hdl", label: "HDL Cholesterol", unit: "mg/dL", low: 40, lowLabel: "Low HDL (Bad for Heart)" },
    { field: "triglycerides", label: "Triglycerides", unit: "mg/dL", high: 150, critical: 200 },
    { field: "systolicBP", label: "Systolic BP", unit: "mmHg", high: 130, critical: 140 },
    { field: "diastolicBP", label: "Diastolic BP", unit: "mmHg", high: 85, critical: 90 },
    { field: "hemoglobin", label: "Hemoglobin", unit: "g/dL", low: 12, lowLabel: "Low Hemoglobin (Anemia Risk)" },
    { field: "creatinine", label: "Creatinine", unit: "mg/dL", high: 1.3, critical: 1.5 },
    { field: "tsh", label: "TSH (Thyroid)", unit: "mIU/L", high: 4.0, critical: 6.0, low: 0.4, lowLabel: "Low TSH (Hyperthyroidism Risk)" },
    { field: "hba1c", label: "HbA1c", unit: "%", high: 5.7, critical: 6.5 },
    { field: "vitaminD", label: "Vitamin D", unit: "ng/mL", low: 20, lowLabel: "Vitamin D Deficiency" },
    { field: "vitaminB12", label: "Vitamin B12", unit: "pg/mL", low: 200, lowLabel: "Vitamin B12 Deficiency" },
    { field: "uricAcid", label: "Uric Acid", unit: "mg/dL", high: 6.8, critical: 8.0 },
    { field: "alt", label: "ALT (Liver)", unit: "U/L", high: 56, critical: 100 },
    { field: "ast", label: "AST (Liver)", unit: "U/L", high: 40, critical: 80 },
];

const getSeverity = (value, threshold) => {
    const alerts = [];

    if (threshold.high && value > (threshold.critical || threshold.high * 1.2)) {
        alerts.push({ severity: "critical", type: "high", message: `${threshold.label} is critically high at ${value} ${threshold.unit}` });
    } else if (threshold.high && value > threshold.high) {
        alerts.push({ severity: "warning", type: "high", message: `${threshold.label} is elevated at ${value} ${threshold.unit}` });
    }

    if (threshold.low && value < threshold.low) {
        alerts.push({ severity: "warning", type: "low", message: threshold.lowLabel ? `${threshold.lowLabel}: ${value} ${threshold.unit}` : `${threshold.label} is low at ${value} ${threshold.unit}` });
    }

    return alerts;
};

// Detect trend-based alerts across multiple reports
function detectTrendAlerts(reports) {
    if (reports.length < 3) return [];
    const trendAlerts = [];
    const TREND_FIELDS = [
        { field: "glucose", label: "Blood Glucose", unit: "mg/dL", direction: "rising" },
        { field: "ldl", label: "LDL Cholesterol", unit: "mg/dL", direction: "rising" },
        { field: "cholesterol", label: "Total Cholesterol", unit: "mg/dL", direction: "rising" },
        { field: "systolicBP", label: "Systolic BP", unit: "mmHg", direction: "rising" },
        { field: "triglycerides", label: "Triglycerides", unit: "mg/dL", direction: "rising" },
        { field: "creatinine", label: "Creatinine", unit: "mg/dL", direction: "rising" },
        { field: "hemoglobin", label: "Hemoglobin", unit: "g/dL", direction: "falling" },
        { field: "hdl", label: "HDL Cholesterol", unit: "mg/dL", direction: "falling" },
        { field: "vitaminD", label: "Vitamin D", unit: "ng/mL", direction: "falling" },
    ];

    const last3 = reports.slice(0, 3); // latest 3

    TREND_FIELDS.forEach(tf => {
        const vals = last3.map(r => r[tf.field]).filter(v => v != null);
        if (vals.length < 3) return;

        const isRisingTrend = vals[0] > vals[1] && vals[1] > vals[2];
        const isFallingTrend = vals[0] < vals[1] && vals[1] < vals[2];

        if (tf.direction === "rising" && isRisingTrend) {
            const totalIncrease = ((vals[0] - vals[2]) / vals[2] * 100).toFixed(1);
            trendAlerts.push({
                severity: "trend",
                type: "trend",
                field: tf.field,
                label: tf.label,
                unit: tf.unit,
                message: `${tf.label} has been rising for 3 consecutive reports (+${totalIncrease}%)`,
                value: vals[0],
                trendValues: vals,
                isTrend: true,
            });
        }

        if (tf.direction === "falling" && isFallingTrend) {
            const totalDecrease = ((vals[2] - vals[0]) / vals[2] * 100).toFixed(1);
            trendAlerts.push({
                severity: "trend",
                type: "trend",
                field: tf.field,
                label: tf.label,
                unit: tf.unit,
                message: `${tf.label} has been declining for 3 consecutive reports (-${totalDecrease}%)`,
                value: vals[0],
                trendValues: vals,
                isTrend: true,
            });
        }
    });

    return trendAlerts;
}

// GET /api/alerts — Get health alerts from latest report + trend alerts
router.get("/", authMiddleware, async (req, res) => {
    try {
        const reports = await LabReport.find({ userId: req.userId }).sort({ date: -1 }).limit(5);

        if (reports.length === 0) {
            return res.json({ alerts: [], message: "No lab reports found. Add a report to see alerts." });
        }

        const latestReport = reports[0];
        const alerts = [];

        // Rule-based alerts from latest report
        THRESHOLDS.forEach((threshold) => {
            const value = latestReport[threshold.field];
            if (value !== undefined && value !== null) {
                const fieldAlerts = getSeverity(value, threshold);
                fieldAlerts.forEach(alert => {
                    alerts.push({
                        ...alert,
                        field: threshold.field,
                        label: threshold.label,
                        value,
                        unit: threshold.unit,
                        reportDate: latestReport.date,
                        isTrend: false,
                    });
                });
            }
        });

        // Trend-based alerts from last 3 reports
        const trendAlerts = detectTrendAlerts(reports);
        alerts.push(...trendAlerts);

        // Sort: critical first, then trends, then warnings
        alerts.sort((a, b) => {
            const order = { critical: 0, trend: 1, warning: 2 };
            return (order[a.severity] || 2) - (order[b.severity] || 2);
        });

        res.json({
            alerts,
            reportDate: latestReport.date,
            totalAlerts: alerts.length,
            criticalCount: alerts.filter(a => a.severity === "critical").length,
            trendCount: alerts.filter(a => a.isTrend).length,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
