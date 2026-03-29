const fs = require('fs');
const PDFDocument = require('pdfkit');

// Create a document
const doc = new PDFDocument({ margin: 50 });

// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
const outputPath = 'c:\\Users\\diksh\\OneDrive\\Desktop\\Sample_Lab_Report.pdf';
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// Add Header
doc.fontSize(24).font('Helvetica-Bold').text('APOLLO HEALTH DIAGNOSTICS', { align: 'center' });
doc.moveDown();
doc.fontSize(10).font('Helvetica').text('Patient: Diksha K', { align: 'left' });
doc.text('Age/Gender: 25 / Female', { align: 'left' });
doc.text('Date of Collection: 09-Mar-2026', { align: 'left' });
doc.text('Report ID: #RPT-889021', { align: 'left' });

doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
doc.moveDown();

// Add Title
doc.fontSize(18).font('Helvetica-Bold').text('COMPREHENSIVE HEALTH PANEL', { align: 'center' });
doc.moveDown();

// Helper to draw a table row
function drawRow(key, value, unit, range, isHighlight = false) {
    const y = doc.y;
    doc.fontSize(11).font(isHighlight ? 'Helvetica-Bold' : 'Helvetica');
    if (isHighlight) doc.fillColor('red');
    else doc.fillColor('black');

    doc.text(key, 50, y);
    doc.text(value, 250, y);
    doc.text(unit, 350, y);
    doc.text(range, 450, y);
    doc.moveDown(0.5);
}

// Table Header
const startY = doc.y;
doc.fontSize(12).font('Helvetica-Bold').fillColor('black');
doc.text('Test Name', 50, startY);
doc.text('Result Value', 250, startY);
doc.text('Unit', 350, startY);
doc.text('Reference Range', 450, startY);
doc.moveDown();
doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
doc.moveDown();

// Data Rows - Slightly Unhealthy for cool AI results
drawRow('Glucose (Fasting)', '105', 'mg/dL', '70 - 99', true); // High
drawRow('HbA1c', '6.1', '%', '< 5.7', true); // Pre-diabetic

doc.moveDown();
drawRow('Total Cholesterol', '230', 'mg/dL', '< 200', true); // High
drawRow('HDL Cholesterol', '38', 'mg/dL', '> 40', true); // Low
drawRow('LDL Cholesterol', '150', 'mg/dL', '< 100', true); // High
drawRow('Triglycerides', '165', 'mg/dL', '< 150', true); // Slightly High

doc.moveDown();
drawRow('Systolic BP', '135', 'mmHg', '< 120', true); // High
drawRow('Diastolic BP', '85', 'mmHg', '< 80', true); // High

doc.moveDown();
drawRow('Hemoglobin', '13.5', 'g/dL', '12 - 15.5', false);
drawRow('WBC Count', '6.5', '10^3/uL', '4.5 - 11', false);
drawRow('Platelets', '250', '10^3/uL', '150 - 400', false);

doc.moveDown();
drawRow('Creatinine', '0.9', 'mg/dL', '0.6 - 1.1', false);
drawRow('ALT (SGPT)', '45', 'U/L', '7 - 55', false);
drawRow('AST (SGOT)', '30', 'U/L', '8 - 48', false);

doc.moveDown();
drawRow('TSH', '2.5', 'mIU/L', '0.4 - 4.0', false);
drawRow('Vitamin D (25-OH)', '18', 'ng/mL', '20 - 50', true); // Deficient
drawRow('Vitamin B12', '450', 'pg/mL', '200 - 900', false);

doc.moveDown(2);
doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('black').stroke();
doc.moveDown();

// Footer
doc.fontSize(10).font('Helvetica-Oblique').fillColor('grey').text('*** End of Report ***', { align: 'center' });
doc.text('This is a computer-generated report and does not require a physical signature.', { align: 'center' });

// Finalize PDF file
doc.end();

stream.on('finish', () => {
    console.log('PDF generated successfully at: ' + outputPath);
});
