const fs = require('fs');
const PDFParser = require('pdf2json');

async function test() {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1); // 1 = text mode

        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            console.log("Extracted Text Length:", rawText.length);
            console.log("Text Preview:", rawText.substring(0, 500));
            resolve(rawText);
        });

        pdfParser.loadPDF('C:\\Users\\diksh\\OneDrive\\Desktop\\Sample_Lab_Report.pdf');
    });
}
test().catch(console.error);
