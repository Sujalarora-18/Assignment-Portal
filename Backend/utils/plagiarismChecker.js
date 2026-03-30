const fs = require('fs');
const stringSimilarity = require('string-similarity');
const Assignment = require('../models/Assignment');

/**
 * Extracts text from a PDF file using pdfjs-dist (compatible with Node.js v22+)
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} Extracted and cleaned text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    // Dynamic import because pdfjs-dist is an ES module
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }

    const cleanedText = fullText.replace(/\s+/g, ' ').trim().toLowerCase();
    console.log('[Plagiarism] Extracted text length from PDF:', cleanedText.length);
    return cleanedText;
  } catch (error) {
    console.error('[Plagiarism] Error extracting text from PDF:', error.message);
    return '';
  }
};

/**
 * Compares the new assignment's text against all other submissions in the DB
 * @param {string} newText - The extracted text of the new assignment
 * @param {string} studentId - The ID of the student submitting the assignment
 * @param {string} category - The category of the assignment
 * @returns {Promise<{ maxScore: number, matchId: string | null }>}
 */
const checkPlagiarism = async (newText, studentId, category) => {
  if (!newText || newText.length < 50) {
    console.log('[Plagiarism] Text too short or empty, skipping. Length:', newText ? newText.length : 0);
    return { maxScore: 0, matchId: null };
  }

  console.log('[Plagiarism] Checking text of length:', newText.length, 'for student:', studentId);

  try {
    // Find all other assignments with extracted text from other students
    const otherAssignments = await Assignment.find({
      student: { $ne: studentId },
      extractedText: { $exists: true, $ne: '' }
    }).select('extractedText _id');

    console.log('[Plagiarism] Found', otherAssignments.length, 'other assignments to compare against.');

    if (otherAssignments.length === 0) {
      return { maxScore: 0, matchId: null };
    }

    let maxScore = 0;
    let matchId = null;

    for (const doc of otherAssignments) {
      if (!doc.extractedText || doc.extractedText.length < 50) continue;
      const score = stringSimilarity.compareTwoStrings(newText, doc.extractedText);
      if (score > maxScore) {
        maxScore = score;
        matchId = doc._id;
      }
    }

    const roundedScore = Math.round(maxScore * 100);
    console.log('[Plagiarism] Final score:', roundedScore, '%, matchId:', matchId);
    return { maxScore: roundedScore, matchId };
  } catch (error) {
    console.error('[Plagiarism] Error during comparison:', error.message);
    return { maxScore: 0, matchId: null };
  }
};

module.exports = {
  extractTextFromPDF,
  checkPlagiarism
};
