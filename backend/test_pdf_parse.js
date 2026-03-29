const fs = require('fs');
const pdfParse = require('pdf-parse');

async function testPdfParse() {
    try {
        const buffer = fs.readFileSync('C:\\Users\\diksh\\OneDrive\\Desktop\\Sample_Lab_Report.pdf');
        console.log("Buffer length:", buffer.length);

        const data = await pdfParse(buffer);
        console.log("PDF Text using pdf-parse:", data.text.substring(0, 500));
    } catch (err) {
        console.error("PDF Parse Error:", err);
    }
}
testPdfParse();
