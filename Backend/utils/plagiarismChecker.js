const fs = require('fs');
const pdfParse = require('pdf-parse');
const stringSimilarity = require('string-similarity');
const Assignment = require('../models/Assignment');

/**
 * Extracts text from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    // Clean text: remove excessive whitespaces and make it lowercase
    const cleanedText = (data.text || '').replace(/\s+/g, ' ').trim().toLowerCase();
    
    return cleanedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
};

/**
 * Compares the new assignment's text against all other submissions
 * @param {string} newText - The extracted text of the new assignment
 * @param {string} studentId - The ID of the student submitting the assignment
 * @param {string} category - The category of the assignment (to only compare within the same category)
 * @returns {Promise<{ maxScore: number, matchId: string | null }>} Highest similarity score and matched assignment ID
 */
const checkPlagiarism = async (newText, studentId, category) => {
  if (!newText || newText.length < 50) {
    // If text is too short or empty, skip checking
    return { maxScore: 0, matchId: null };
  }

  try {
    // Find all other assignments that have extracted text and belong to other students
    const otherAssignments = await Assignment.find({
      student: { $ne: studentId },
      category: category,
      extractedText: { $exists: true, $ne: '' }
    }).select('extractedText _id');

    if (otherAssignments.length === 0) {
      return { maxScore: 0, matchId: null };
    }

    let maxScore = 0;
    let matchId = null;

    // Compare with all other texts
    for (const doc of otherAssignments) {
        if (!doc.extractedText || doc.extractedText.length < 50) continue;
        
        // Use Dice's Coefficient to find similarity
        const score = stringSimilarity.compareTwoStrings(newText, doc.extractedText);
        
        if (score > maxScore) {
            maxScore = score;
            matchId = doc._id;
        }
    }

    // Convert score from 0-1 range to 0-100 percentage
    const roundedScore = Math.round(maxScore * 100);

    return { maxScore: roundedScore, matchId };
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    return { maxScore: 0, matchId: null };
  }
};

module.exports = {
  extractTextFromPDF,
  checkPlagiarism
};
