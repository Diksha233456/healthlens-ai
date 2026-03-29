const fs = require('fs');
const PDFParser = require('pdf2json');

async function testBuffer() {
    try {
        const buffer = fs.readFileSync('C:\\Users\\diksh\\OneDrive\\Desktop\\Sample_Lab_Report.pdf');

        console.log("Buffer length:", buffer.length);

        const pdfText = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(null, 1);
            pdfParser.on("pdfParser_dataError", errData => {
                console.error("Internal Data Error:", errData);
                reject(errData.parserError);
            });
            pdfParser.on("pdfParser_dataReady", () => {
                resolve(pdfParser.getRawTextContent());
            });
            pdfParser.parseBuffer(buffer);
        });

        console.log("Text length:", pdfText.length);
        console.log("Preview:", pdfText.substring(0, 100));
    } catch (err) {
        console.error("Test Error:", err);
    }
}
testBuffer();
