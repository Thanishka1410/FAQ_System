import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FAQ from '../models/FAQ.js';
import { preprocessText } from './similarityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Potential paths where the user might drop the FAQs file
const POTENTIAL_PATHS = [
  path.resolve(__dirname, '../../FAQ_info.txt'),   // Project root FAQ_info.txt
  path.resolve(__dirname, '../FAQ_info.txt'),      // Server root FAQ_info.txt
  path.resolve(__dirname, '../../faqs.json'),      // Project root JSON
  path.resolve(__dirname, '../faqs.json'),         // Server root JSON
  path.resolve(__dirname, '../../faqs.txt'),       // Project root TXT
  path.resolve(__dirname, '../faqs.txt'),          // Server root TXT
];

/**
 * Checks if a user-supplied FAQ file is present.
 * @returns {string|null} Path to the file if found, otherwise null
 */
export const locateFAQFile = () => {
  for (const filePath of POTENTIAL_PATHS) {
    if (fs.existsSync(filePath)) {
      console.log(`Located user FAQ/RAG file at: ${filePath}`);
      return filePath;
    }
  }
  return null;
};

// Mappings from parsed section to canonical CATEGORIES
const createFAQObject = (question, answer, section) => {
  const sectionLower = section.toLowerCase();
  let category = 'General Queries';
  
  if (sectionLower.includes('offer') || sectionLower.includes('letter')) {
    category = 'Offer Letter';
  } else if (sectionLower.includes('selection') || sectionLower.includes('confirm')) {
    category = 'Selection Confirmation';
  } else if (sectionLower.includes('login') || sectionLower.includes('portal')) {
    category = 'Login Issues';
  } else if (sectionLower.includes('noc') || sectionLower.includes('certificate')) {
    category = 'Certificate';
  } else if (
    sectionLower.includes('internship') || 
    sectionLower.includes('timing') || 
    sectionLower.includes('dates') || 
    sectionLower.includes('work') || 
    sectionLower.includes('mentorship') || 
    sectionLower.includes('project') || 
    sectionLower.includes('rosetta') || 
    sectionLower.includes('journal') || 
    sectionLower.includes('coursework') || 
    sectionLower.includes('vibe') || 
    sectionLower.includes('phase 1')
  ) {
    category = 'Internship Process';
  } else if (sectionLower.includes('technical') || sectionLower.includes('bug') || sectionLower.includes('error')) {
    category = 'Technical Issues';
  }
  
  return {
    question,
    answer,
    category,
    keywords: preprocessText(question),
    views: 0,
    helpfulCount: 0,
    notHelpfulCount: 0,
    duplicateMatchCount: 0,
    confusionScore: 0
  };
};

/**
 * Parses structured text format containing § symbols (e.g., FAQ_info.txt)
 * @param {string} content 
 * @returns {Array} List of FAQ objects
 */
const parseStructuredTextFAQ = (content) => {
  const lines = content.split('\n');
  const faqs = [];
  
  let currentSection = 'General Queries';
  let currentQuestion = '';
  let currentAnswerLines = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Check if it's a section title line (e.g., "1. About the internship §")
    const sectionMatch = line.match(/^\d+\.\s+([^§]+)§/);
    if (sectionMatch) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        faqs.push(createFAQObject(currentQuestion, currentAnswerLines.join('\n'), currentSection));
      }
      currentSection = sectionMatch[1].trim();
      currentQuestion = '';
      currentAnswerLines = [];
      continue;
    }
    
    // Check if it's a question line (e.g., "1.1 What is the Vicharanashala internship? §")
    const questionMatch = line.match(/^\d+\.\d+\s+([^§]+)§/);
    if (questionMatch) {
      if (currentQuestion && currentAnswerLines.length > 0) {
        faqs.push(createFAQObject(currentQuestion, currentAnswerLines.join('\n'), currentSection));
      }
      currentQuestion = questionMatch[1].trim();
      currentAnswerLines = [];
      continue;
    }
    
    if (currentQuestion) {
      currentAnswerLines.push(line);
    }
  }
  
  // Save the last FAQ
  if (currentQuestion && currentAnswerLines.length > 0) {
    faqs.push(createFAQObject(currentQuestion, currentAnswerLines.join('\n'), currentSection));
  }
  
  return faqs;
};

/**
 * Parses a plain text FAQ file. Matches pattern like:
 * Q: When will I receive my offer letter?
 * A: You will receive your offer letter in 7 days.
 * Category: Offer Letter
 * Keywords: offer, letter, delay
 * @param {string} textContent 
 * @returns {Array} List of FAQ objects
 */
const parseTextFAQ = (textContent) => {
  const faqs = [];
  // Split on double newlines to separate blocks
  const blocks = textContent.split(/\n\s*\n/);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n');
    let question = '';
    let answer = '';
    let category = 'General Queries';
    let keywords = [];
    
    for (const line of lines) {
      const qMatch = line.match(/^Q:\s*(.*)$/i);
      const aMatch = line.match(/^A:\s*(.*)$/i);
      const catMatch = line.match(/^Category:\s*(.*)$/i);
      const kwMatch = line.match(/^Keywords:\s*(.*)$/i);
      
      if (qMatch) question = qMatch[1].trim();
      else if (aMatch) answer = aMatch[1].trim();
      else if (catMatch) category = catMatch[1].trim();
      else if (kwMatch) keywords = kwMatch[1].split(',').map(k => k.trim()).filter(Boolean);
    }
    
    if (question && answer) {
      faqs.push({
        question,
        answer,
        category,
        keywords: keywords.length > 0 ? keywords : preprocessText(question),
        views: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        duplicateMatchCount: 0,
        confusionScore: 0
      });
    }
  }
  
  return faqs;
};

/**
 * Load FAQs from local placed file to parse and return.
 * @returns {Array} Array of parsed FAQs or empty array
 */
export const loadFAQsFromFile = () => {
  const filePath = locateFAQFile();
  if (!filePath) return [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (filePath.endsWith('.json')) {
      const data = JSON.parse(content);
      // Ensure it is an array
      const faqs = Array.isArray(data) ? data : [data];
      return faqs.map(faq => ({
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || 'General Queries',
        keywords: faq.keywords || preprocessText(faq.question || ''),
        views: faq.views || 0,
        helpfulCount: faq.helpfulCount || 0,
        notHelpfulCount: faq.notHelpfulCount || 0,
        duplicateMatchCount: faq.duplicateMatchCount || 0,
        confusionScore: faq.confusionScore || 0
      }));
    } else if (filePath.endsWith('.txt')) {
      if (content.includes('§')) {
        return parseStructuredTextFAQ(content);
      }
      return parseTextFAQ(content);
    }
  } catch (error) {
    console.error(`Error reading/parsing FAQ file at ${filePath}:`, error.message);
  }
  
  return [];
};

/**
 * Synchronizes the database FAQs with the local file content.
 * Avoids duplicates by matching questions exactly.
 * @returns {object} { addedCount, updatedCount, totalCount }
 */
export const syncFAQsWithFile = async () => {
  const fileFAQs = loadFAQsFromFile();
  if (fileFAQs.length === 0) {
    return { success: false, message: 'No local file found or file is empty.' };
  }
  
  let addedCount = 0;
  let updatedCount = 0;
  
  for (const item of fileFAQs) {
    // Look for exact match by question text
    const existing = await FAQ.findOne({ question: item.question });
    
    if (existing) {
      // Update details
      existing.answer = item.answer;
      existing.category = item.category;
      if (item.keywords && item.keywords.length > 0) {
        existing.keywords = item.keywords;
      }
      await existing.save();
      updatedCount++;
    } else {
      // Add new
      await FAQ.create(item);
      addedCount++;
    }
  }
  
  const totalCount = await FAQ.countDocuments();
  return {
    success: true,
    addedCount,
    updatedCount,
    totalCount,
    message: `Synchronized ${fileFAQs.length} FAQs from local file: added ${addedCount}, updated ${updatedCount}. Total FAQs in DB: ${totalCount}.`
  };
};
