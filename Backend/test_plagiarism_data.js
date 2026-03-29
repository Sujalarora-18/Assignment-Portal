const mongoose = require('mongoose');
const Assignment = require('./models/Assignment');
const path = require('path');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");
    
    // Find the last 5 assignments uploaded
    const recent = await Assignment.find()
      .select('title student category extractedText plagiarismScore')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log("Recent Assignments:");
    for (const a of recent) {
      console.log(`- Title: ${a.title}`);
      console.log(`  Student ID: ${a.student}`);
      console.log(`  Category: ${a.category}`);
      console.log(`  Plagiarism Score: ${a.plagiarismScore}`);
      console.log(`  Has Extracted Text: ${!!a.extractedText}`);
      if (a.extractedText) {
        console.log(`  Text Length: ${a.extractedText.length}`);
        console.log(`  Sample: ${a.extractedText.substring(0, 100).replace(/\n/g, ' ')}...`);
      }
      console.log("---");
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
