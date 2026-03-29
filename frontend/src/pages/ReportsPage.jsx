import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { addReport, getReports, deleteReport, extractPdf } from '../api';

const FIELDS = [
    {
        group: 'Blood Sugar', fields: [
            { key: 'glucose', label: 'Glucose (Fasting)', unit: 'mg/dL', normal: '70–99', placeholder: 'e.g. 95' },
            { key: 'hba1c', label: 'HbA1c', unit: '%', normal: '<5.7', placeholder: 'e.g. 5.5' },
        ]
    },
    {
        group: 'Lipid Panel', fields: [
            { key: 'cholesterol', label: 'Total Cholesterol', unit: 'mg/dL', normal: '<200', placeholder: 'e.g. 190' },
            { key: 'hdl', label: 'HDL Cholesterol', unit: 'mg/dL', normal: '>40', placeholder: 'e.g. 55' },
            { key: 'ldl', label: 'LDL Cholesterol', unit: 'mg/dL', normal: '<100', placeholder: 'e.g. 130' },
            { key: 'triglycerides', label: 'Triglycerides', unit: 'mg/dL', normal: '<150', placeholder: 'e.g. 140' },
        ]
    },
    {
        group: 'Blood Pressure', fields: [
            { key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg', normal: '<120', placeholder: 'e.g. 120' },
            { key: 'diastolicBP', label: 'Diastolic BP', unit: 'mmHg', normal: '<80', placeholder: 'e.g. 80' },
        ]
    },
    {
        group: 'Blood Count', fields: [
            { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normal: '12–17.5', placeholder: 'e.g. 14' },
            { key: 'wbc', label: 'WBC', unit: '10³/μL', normal: '4.5–11', placeholder: 'e.g. 7.5' },
            { key: 'platelets', label: 'Platelets', unit: '10³/μL', normal: '150–400', placeholder: 'e.g. 250' },
        ]
    },
    {
        group: 'Kidney & Liver', fields: [
            { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normal: '0.7–1.3', placeholder: 'e.g. 1.0' },
            { key: 'uricAcid', label: 'Uric Acid', unit: 'mg/dL', normal: '3.5–7.2', placeholder: 'e.g. 5.5' },
            { key: 'alt', label: 'ALT', unit: 'U/L', normal: '7–56', placeholder: 'e.g. 30' },
            { key: 'ast', label: 'AST', unit: 'U/L', normal: '10–40', placeholder: 'e.g. 25' },
        ]
    },
    {
        group: 'Thyroid & Vitamins', fields: [
            { key: 'tsh', label: 'TSH', unit: 'mIU/L', normal: '0.4–4.0', placeholder: 'e.g. 2.0' },
            { key: 'vitaminD', label: 'Vitamin D', unit: 'ng/mL', normal: '20–50', placeholder: 'e.g. 35' },
            { key: 'vitaminB12', label: 'Vitamin B12', unit: 'pg/mL', normal: '200–900', placeholder: 'e.g. 450' },
        ]
    },
    {
        group: 'Body Metrics', fields: [
            { key: 'bmi', label: 'BMI', unit: '', normal: '18.5–24.9', placeholder: 'e.g. 23.5' },
            { key: 'weight', label: 'Weight', unit: 'kg', normal: '', placeholder: 'e.g. 70' },
        ]
    },
];

const emptyForm = () => {
    const f = { date: new Date().toISOString().split('T')[0], notes: '', labName: '' };
    FIELDS.forEach(g => g.fields.forEach(field => { f[field.key] = ''; }));
    return f;
};

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [submitting, setSubmitting] = useState(false);

    // AI Extraction states
    const [isExtracting, setIsExtracting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await getReports();
            setReports(res.data);
        } catch {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            return toast.error('Please upload a valid PDF file.');
        }

        setIsExtracting(true);
        const toastId = toast.loading('🧠 Extracting data using AI...', { style: { minWidth: '300px' } });

        try {
            const formData = new FormData();
            formData.append('reportDocument', file);

            const res = await extractPdf(formData);
            const extractedData = res.data.data;

            // Auto-fill the form with extracted flat JSON object
            setForm(prev => {
                const newForm = { ...prev };
                let fieldsFound = 0;

                Object.keys(extractedData).forEach(key => {
                    if (extractedData[key] !== null && extractedData[key] !== undefined) {
                        newForm[key] = extractedData[key];
                        fieldsFound++;
                    }
                });

                if (fieldsFound > 0) {
                    toast.success(`Magic! ✨ Extracted ${fieldsFound} fields from your PDF`);
                } else {
                    toast.error('No readable numerical biomarkers found in this PDF.');
                }
                return newForm;
            });

        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to extract data. Please manually enter values.');
        } finally {
            toast.dismiss(toastId);
            setIsExtracting(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Clean: Only send fields that have values
            const cleanedForm = { date: form.date, notes: form.notes, labName: form.labName };
            FIELDS.forEach(g => g.fields.forEach(field => {
                if (form[field.key] !== '') cleanedForm[field.key] = parseFloat(form[field.key]);
            }));
            await addReport(cleanedForm);
            toast.success('Lab report added successfully! 🧪');
            setShowForm(false);
            setForm(emptyForm());
            fetchReports();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add report');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this report?')) return;
        try {
            await deleteReport(id);
            toast.success('Report deleted');
            setReports(reports.filter(r => r._id !== id));
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1>🧪 Lab Reports</h1>
                        <p>Manage your blood test results and biomarkers</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" id="add-report-btn">
                        {showForm ? '✕ Cancel' : '+ Add New Report'}
                    </button>
                </div>
            </div>

            {/* Add Report Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ marginBottom: '32px', overflow: 'hidden' }}
                    >
                        <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '24px', gap: '16px' }}>
                                <h3>Add New Lab Report</h3>

                                <div style={{ background: 'rgba(0, 212, 255, 0.08)', border: '1px dashed var(--cyan)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--cyan)', fontSize: '0.9rem' }}>✨ AI Magic Extract</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Upload PDF to auto-fill fields</div>
                                    </div>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handlePdfUpload}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        id="pdf-upload"
                                    />
                                    <label htmlFor="pdf-upload" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer', margin: 0, opacity: isExtracting ? 0.7 : 1 }}>
                                        {isExtracting ? (
                                            <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Scanning...</>
                                        ) : (
                                            '📄 Upload PDF'
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="form-row" style={{ marginBottom: '20px' }}>
                                <div className="form-group">
                                    <label className="form-label">Report Date</label>
                                    <input type="date" className="form-input" value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Lab Name (Optional)</label>
                                    <input type="text" className="form-input" placeholder="e.g. SRL Diagnostics"
                                        value={form.labName} onChange={(e) => setForm({ ...form, labName: e.target.value })} />
                                </div>
                            </div>

                            {FIELDS.map((group) => (
                                <div key={group.group} style={{ marginBottom: '24px' }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                                        {group.group}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                        {group.fields.map((field) => (
                                            <div key={field.key}>
                                                <label className="form-label" style={{ marginBottom: '4px' }}>
                                                    {field.label} {field.unit && <span style={{ color: 'var(--text-muted)' }}>({field.unit})</span>}
                                                </label>
                                                <input type="number" step="0.01" className="form-input" placeholder={field.placeholder}
                                                    style={{ padding: '10px 14px', fontSize: '0.88rem' }}
                                                    value={form[field.key]}
                                                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} />
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>Normal: {field.normal}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="form-group">
                                <label className="form-label">Notes (Optional)</label>
                                <input type="text" className="form-input" placeholder="Any additional notes..."
                                    value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary" disabled={submitting} id="submit-report-btn">
                                    {submitting ? '⏳ Saving...' : '💾 Save Report'}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reports List */}
            {loading ? (
                <div className="loading-overlay"><div className="spinner" /></div>
            ) : reports.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">🧪</div>
                    <div className="empty-state-title">No Reports Yet</div>
                    <div className="empty-state-desc">Add your first lab report to start tracking your health biomarkers.</div>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>Add First Report</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reports.map((report, i) => (
                        <motion.div
                            key={report._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass-card"
                            style={{ padding: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>📅 {new Date(report.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                    {report.labName && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>🏥 {report.labName}</div>}
                                </div>
                                <button onClick={() => handleDelete(report._id)} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>🗑 Delete</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                                {[
                                    { key: 'glucose', label: 'Glucose', unit: 'mg/dL' },
                                    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL' },
                                    { key: 'ldl', label: 'LDL', unit: 'mg/dL' },
                                    { key: 'hdl', label: 'HDL', unit: 'mg/dL' },
                                    { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL' },
                                    { key: 'hba1c', label: 'HbA1c', unit: '%' },
                                    { key: 'systolicBP', label: 'Systolic BP', unit: 'mmHg' },
                                    { key: 'bmi', label: 'BMI', unit: '' },
                                ].filter(f => report[f.key] != null).map(({ key, label, unit }) => (
                                    <div key={key} style={{ background: 'var(--bg-card)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
                                        <div style={{ fontWeight: 700, fontFamily: 'Space Grotesk', fontSize: '1.1rem' }}>{report[key]} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{unit}</span></div>
                                    </div>
                                ))}
                            </div>
                            {report.notes && <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>📝 {report.notes}</div>}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
