const fs = require('fs');
const pdfParse = require('pdf-parse');

async function test() {
    try {
        const dataBuffer = fs.readFileSync('C:\\Users\\diksh\\OneDrive\\Desktop\\Sample_Lab_Report.pdf');
        console.log("Buffer size:", dataBuffer.length);
        const data = await pdfParse(dataBuffer);
        console.log("Extracted text length:", data.text.length);
        console.log(data.text);
    } catch (err) {
        console.error("PDF PARSE ERROR:", err);
    }
}
test();
