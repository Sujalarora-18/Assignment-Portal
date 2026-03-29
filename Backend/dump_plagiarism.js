const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const fs = require('fs');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const recent = await Assignment.find()
      .select('title student category +extractedText plagiarismScore filePath createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const out = recent.map(a => ({
      title: a.title,
      studentId: a.student,
      filePath: a.filePath,
      createdAt: a.createdAt,
      plagiarismScore: a.plagiarismScore,
      hasExtractedText: !!a.extractedText,
      textLength: a.extractedText ? a.extractedText.length : 0
    }));

    fs.writeFileSync('db_out.json', JSON.stringify(out, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
