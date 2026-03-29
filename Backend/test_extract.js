const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const path = require('path');
const { extractTextFromPDF } = require('./utils/plagiarismChecker');
require('dotenv').config();

async function testExtraction() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const recent = await Assignment.findOne().sort({ createdAt: -1 });
    
    if (!recent) {
      console.log("No assignments found");
      return process.exit(0);
    }
    
    // Convert /uploads/filename.pdf to correct absolute path
    const relativePath = recent.filePath.replace(/^\//, ''); // removes leading slash
    const filePath = path.join(__dirname, relativePath);
    console.log("Target File:", filePath);
    
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
         console.log("File does not exist on disk:", filePath);
         return process.exit(0);
    }
    
    const text = await extractTextFromPDF(filePath);
    console.log("Extracted text length:", text.length);
    if (text.length > 0) {
        console.log("Success:", text.substring(0, 50));
    } else {
        console.log("Extraction returned empty string");
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testExtraction();
