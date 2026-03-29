const express = require("express");
const Groq = require("groq-sdk");
const authMiddleware = require("../middleware/authMiddleware");
const LabReport = require("../models/LabReport");
const User = require("../models/user");
const multer = require("multer");
const PDFParser = require("pdf2json");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helpers
async function callGroq(prompt, maxTokens = 1024) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: maxTokens,
  });
  return completion.choices[0]?.message?.content || "";
}

async function callGroqChat(messages, maxTokens = 1024) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.5,
    max_tokens: maxTokens,
  });
  return completion.choices[0]?.message?.content || "";
}

async function callGroqVision(prompt, images) {
  const imageUrls = Array.isArray(images) ? images : [images];
  const contentPayload = [{ type: "text", text: prompt }];

  for (const url of imageUrls) {
    contentPayload.push({ type: "image_url", image_url: { url } });
  }

  const completion = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview", // Upgrading to standard vision model
    messages: [
      {
        role: "user",
        content: contentPayload,
      },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
}

function formatBiomarkers(data) {
  const fields = [
    ["Glucose (Fasting)", data.glucose, "mg/dL", "Normal: 70-99"],
    ["HbA1c", data.hba1c, "%", "Normal: <5.7"],
    ["Total Cholesterol", data.cholesterol, "mg/dL", "Normal: <200"],
    ["HDL Cholesterol", data.hdl, "mg/dL", "Normal: >40"],
    ["LDL Cholesterol", data.ldl, "mg/dL", "Normal: <100"],
    ["Triglycerides", data.triglycerides, "mg/dL", "Normal: <150"],
    ["Systolic BP", data.systolicBP, "mmHg", "Normal: <120"],
    ["Diastolic BP", data.diastolicBP, "mmHg", "Normal: <80"],
    ["Hemoglobin", data.hemoglobin, "g/dL", "Normal: 12-17.5"],
    ["WBC", data.wbc, "10³/μL", "Normal: 4.5-11"],
    ["BMI", data.bmi, "", "Normal: 18.5-24.9"],
    ["Creatinine", data.creatinine, "mg/dL", "Normal: 0.7-1.3"],
    ["Uric Acid", data.uricAcid, "mg/dL", "Normal: 3.5-7.2"],
    ["ALT (Liver)", data.alt, "U/L", "Normal: 7-56"],
    ["AST (Liver)", data.ast, "U/L", "Normal: 10-40"],
    ["TSH", data.tsh, "mIU/L", "Normal: 0.4-4.0"],
    ["Vitamin D", data.vitaminD, "ng/mL", "Normal: 20-50"],
    ["Vitamin B12", data.vitaminB12, "pg/mL", "Normal: 200-900"],
    ["Platelets", data.platelets, "10³/μL", "Normal: 150-450"],
    ["Weight", data.weight, "kg", ""],
  ];
  return fields
    .filter(([, val]) => val !== undefined && val !== null)
    .map(([name, val, unit, normal]) => `  - ${name}: ${val} ${unit} (${normal})`)
    .join("\n");
}

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Routes
router.post("/extract-pdf", authMiddleware, upload.single("reportDocument"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });
    let pdfText = "";
    try {
      pdfText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
        pdfParser.loadPDF(req.file.path);
      });
      fs.unlinkSync(req.file.path);
    } catch (parseErr) {
      console.error("PDF Parse Error:", parseErr);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Failed to read text from this PDF file." });
    }
    if (!pdfText || pdfText.trim().length < 50) {
      return res.status(400).json({ error: "Could not extract sufficient text." });
    }

    const prompt = `You are a medical data extraction expert. I have extracted raw text from a patient's lab report PDF.
Read this text carefully and extract the biomarker values into a flat JSON format.

If a value is not found in the text, DO NOT invent one. Either omit the key or set it to null.
Only extract NUMERICAL values as numbers (e.g. 95, not "95 mg/dL").

RAW LAB REPORT TEXT:
----------------------------------------
${pdfText.substring(0, 10000)}
----------------------------------------

Return ONLY valid JSON matching this exact structure:
{
  "glucose": <number or null>,
  "hba1c": <number or null>,
  "cholesterol": <number or null>,
  "hdl": <number or null>,
  "ldl": <number or null>,
  "triglycerides": <number or null>,
  "systolicBP": <number or null>,
  "diastolicBP": <number or null>,
  "hemoglobin": <number or null>,
  "wbc": <number or null>,
  "platelets": <number or null>,
  "creatinine": <number or null>,
  "uricAcid": <number or null>,
  "alt": <number or null>,
  "ast": <number or null>,
  "tsh": <number or null>,
  "vitaminD": <number or null>,
  "vitaminB12": <number or null>,
  "bmi": <number or null>,
  "weight": <number or null>
}`;

    const response = await callGroq(prompt, 1024);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return JSON");
    const extractedData = JSON.parse(jsonMatch[0]);
    const cleanedData = {};
    for (const [key, val] of Object.entries(extractedData)) {
      if (val !== null && typeof val === 'number') cleanedData[key] = val;
    }
    res.json({ success: true, data: cleanedData });
  } catch (error) {
    console.error("Extraction failed:", error);
    res.status(500).json({ error: "Extraction failed" });
  }
});

router.post("/predict-risk", authMiddleware, async (req, res) => {
  try {
    const { biomarkers, lifestyle } = req.body;
    const prompt = `You are an expert medical AI assistant. Analyze these patient biomarkers and provide disease risk predictions.

PATIENT BIOMARKERS:
${formatBiomarkers(biomarkers)}

LIFESTYLE FACTORS:
  - Age: ${lifestyle?.age || "Unknown"}
  - Gender: ${lifestyle?.gender || "Unknown"}
  - Smoking: ${lifestyle?.smokingStatus || "never"}
  - Exercise Level: ${lifestyle?.exerciseLevel || "sedentary"}
  - Diet Quality: ${lifestyle?.dietType || "average"}
  - BMI: ${biomarkers?.bmi || "Unknown"}

Respond ONLY with valid JSON in this exact format (no extra text, no markdown):
{
  "heartRisk": <number 0-100>,
  "diabetesRisk": <number 0-100>,
  "kidneyRisk": <number 0-100>,
  "strokeRisk": <number 0-100>,
  "liverRisk": <number 0-100>,
  "overallRisk": <number 0-100>,
  "riskLevel": "<low|moderate|high|critical>",
  "keyFactors": [
    {"factor": "<biomarker name>", "impact": "<high|medium|low>", "value": "<actual value>", "concern": "<brief explanation>"}
  ],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "summary": "<2-3 sentence overall health assessment>"
}`;
    const response = await callGroq(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    res.json({ success: true, prediction: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    res.status(500).json({ error: "AI prediction failed" });
  }
});

router.post("/simulate-lifestyle", authMiddleware, async (req, res) => {
  try {
    const { biomarkers, currentLifestyle, proposedLifestyle } = req.body;
    const prompt = `You are an expert medical AI. A patient wants to know how lifestyle changes will affect their disease risk.

CURRENT BIOMARKERS:
${formatBiomarkers(biomarkers)}

PROPOSED LIFESTYLE CHANGES:
  - Smoking: ${proposedLifestyle?.smokingStatus || currentLifestyle?.smokingStatus}
  - Exercise: ${proposedLifestyle?.exerciseLevel || currentLifestyle?.exerciseLevel}
  - Diet: ${proposedLifestyle?.dietType || currentLifestyle?.dietType}
  - Target Weight: ${proposedLifestyle?.weight || currentLifestyle?.weight} kg

Respond ONLY with valid JSON (no extra text):
{
  "currentRisks": { "heartRisk": <0-100>, "diabetesRisk": <0-100>, "overallRisk": <0-100> },
  "projectedRisks": { "heartRisk": <0-100>, "diabetesRisk": <0-100>, "overallRisk": <0-100> },
  "improvements": [ {"area": "<area>", "reduction": "<X%>", "explanation": "<brief>"} ],
  "message": "<motivational message>"
}`;
    const response = await callGroq(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    res.json({ success: true, simulation: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    res.status(500).json({ error: "Simulation failed" });
  }
});

router.post("/doctor-summary", authMiddleware, async (req, res) => {
  try {
    const reports = await LabReport.find({ userId: req.userId }).sort({ date: -1 }).limit(6);
    if (reports.length === 0) return res.json({ summary: "No reports found." });

    const reportsText = reports.map((r, i) => {
      const date = new Date(r.date).toLocaleDateString();
      return `Report ${i + 1} (${date}): Glucose=${r.glucose || "N/A"}, Cholesterol=${r.cholesterol || "N/A"}`;
    }).join("\n");

    const prompt = `You are an expert medical doctor. Write a concise health summary for a patient based on these lab reports.
    REPORTS:
    ${reportsText}
    
    Structure the summary with professional but clear language.`;
    const response = await callGroq(prompt, 1500);
    res.json({ success: true, summary: response });
  } catch (error) {
    res.status(500).json({ error: "Summary generation failed" });
  }
});

router.post("/explainable-ai", authMiddleware, async (req, res) => {
  try {
    const { biomarkers, riskType } = req.body;
    const prompt = `Explainable AI analysis for ${riskType}. Explain factors based on these biomarkers: ${formatBiomarkers(biomarkers)}. 
    Return JSON { "riskType": "...", "topContributors": [...], "insight": "..." }`;
    const response = await callGroq(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    res.json({ success: true, explainability: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
});

router.post("/health-chat", authMiddleware, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const user = await User.findById(req.userId);
    const systemContext = `You are HealthLens AI, a professional health assistant. User: ${user?.name}. Always encourage consulting a doctor.`;
    const messages = [{ role: "system", content: systemContext }, ...history.slice(-8), { role: "user", content: message }];
    const response = await callGroqChat(messages, 768);
    res.json({ success: true, reply: response });
  } catch (error) {
    res.status(500).json({ error: "Chat failed" });
  }
});

router.post("/nutrition-plan", authMiddleware, async (req, res) => {
  try {
    const { goals, preferences } = req.body;
    const user = await User.findById(req.userId);
    const prompt = `Create a 7-day nutrition plan for ${user?.name}. Goals: ${goals}. Preferences: ${JSON.stringify(preferences)}. Return ONLY JSON.`;
    const response = await callGroq(prompt, 2048);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");
    res.json({ success: true, plan: JSON.parse(jsonMatch[0]) });
  } catch (error) {
    res.status(500).json({ error: "Plan failing" });
  }
});

router.get("/weekly-digest", authMiddleware, async (req, res) => {
  try {
    const reports = await LabReport.find({ userId: req.userId }).sort({ date: -1 }).limit(3);
    const user = await User.findById(req.userId);
    if (reports.length === 0) return res.json({ success: true, digest: { insight: "No data yet." } });
    const prompt = `Write a encouraging health insight for ${user?.name?.split(' ')[0]}. Focus on wellness.`;
    const insight = await callGroq(prompt, 300);
    res.json({ success: true, digest: { insight } });
  } catch (error) {
    res.status(500).json({ error: "Digest failed" });
  }
});

// THE NEW FEATURE ROUTE
router.post("/vision-scan", authMiddleware, async (req, res) => {
  console.log("📸 Vision Scan Request Received (360 Degree)");
  try {
    const { image, images, isMultiAngle } = req.body;
    const targetImages = images || (image ? [image] : []);

    if (targetImages.length === 0) return res.status(400).json({ error: "No image provided" });

    let resultData = null;
    let fallbackUsed = false;

    // 1. Try Vision Model
    try {
      const prompt = isMultiAngle
        ? `Analyze these 3 multi-angle facial snapshots (front, left, right) for a comprehensive 360-degree wellness analysis. vitalityScore(0-100), stressLevel(Low/Moderate/High), markers(array), summary, recommendation. Return ONLY JSON.`
        : `Analyze this facial snapshot for wellness markers. vitalityScore(0-100), stressLevel(Low/Moderate/High), markers(array), summary, recommendation. Return ONLY JSON.`;

      const response = await callGroqVision(
        prompt,
        targetImages
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) resultData = JSON.parse(jsonMatch[0]);
    } catch (visionErr) {
      console.warn("Vision API failed, attempting smart fallback:", visionErr.message);
      fallbackUsed = true;
    }

    // 2. Smart Fallback: Use Llama 3.3 text model + User data
    if (!resultData) {
      const user = await User.findById(req.userId);
      const latestReport = await LabReport.findOne({ userId: req.userId }).sort({ date: -1 });
      const biomarkers = latestReport ? formatBiomarkers(latestReport) : "No recent reports";

      const fallbackPrompt = `You are the HealthLens AI. Generate a "Bio-Sync Health Analysis" for ${user?.name || "the patient"} based on their medical profile.
      
      CONTEXT:
      - Age: ${user?.age || "Unknown"}
      - Gender: ${user?.gender || "Unknown"}
      - Biomarkers: ${biomarkers}

      Create a supportive assessment of their current wellness markers (vitality, stress).
      Return ONLY a JSON object:
      {
        "vitalityScore": 0-100,
        "stressLevel": "Low/Moderate/High",
        "markers": ["Marker 1", "Marker 2", "Marker 3"],
        "summary": "1-2 sentence supportive analysis",
        "recommendation": "One specific actionable health tip"
      }`;

      const response = await callGroq(fallbackPrompt, 500);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultData = JSON.parse(jsonMatch[0]);
        resultData.isVirtual = true;
      }
    }

    if (!resultData) throw new Error("Analysis failed completely");

    res.json({ success: true, data: resultData, fallback: fallbackUsed });

  } catch (error) {
    console.error("Vision Scan Error:", error.message);
    res.status(500).json({ error: "Vision analysis failed", details: error.message });
  }
});

module.exports = router;
