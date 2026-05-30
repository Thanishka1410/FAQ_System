import { preprocessText } from './similarityService.js';

// Keyword-to-tag mapping
const TAG_KEYWORD_MAP = {
  'offer': 'offer-letter',
  'letter': 'offer-letter',
  'selection': 'selection',
  'confirm': 'confirmation',
  'confirmation': 'confirmation',
  'login': 'portal-login',
  'signin': 'portal-login',
  'password': 'password-reset',
  'portal': 'portal',
  'certificate': 'certificate',
  'lor': 'lor',
  'recommendation': 'lor',
  'process': 'internship-process',
  'timeline': 'timeline',
  'duration': 'duration',
  'technical': 'tech-issue',
  'bug': 'tech-issue',
  'error': 'tech-issue',
  'server': 'server-issue',
  'stipend': 'stipend',
  'pay': 'stipend',
  'payment': 'stipend',
  'project': 'projects',
  'mentor': 'mentor-allocation',
  'guideline': 'guidelines',
  'noc': 'noc',
  'college': 'noc'
};

/**
 * Automatically generates a list of tags from a question title and description.
 * @param {string} title 
 * @param {string} description 
 * @param {string} category 
 * @returns {string[]} Array of unique string tags
 */
export const generateTags = (title, description = '', category = '') => {
  const tags = new Set();
  
  // 1. Add category-based base tag
  if (category) {
    tags.add(category.toLowerCase().replace(/\s+/g, '-'));
  }
  
  // 2. Process words in title and description to match mapping
  const titleTerms = preprocessText(title);
  const descTerms = preprocessText(description);
  const allTerms = [...new Set([...titleTerms, ...descTerms])];
  
  allTerms.forEach(term => {
    if (TAG_KEYWORD_MAP[term]) {
      tags.add(TAG_KEYWORD_MAP[term]);
    }
  });
  
  // 3. Fallback: if no tags were matched, extract top 3 longest terms as tags
  if (tags.size <= 1) {
    const sortedTerms = allTerms
      .filter(t => t.length > 3)
      .sort((a, b) => b.length - a.length);
    
    sortedTerms.slice(0, 3).forEach(term => {
      tags.add(term);
    });
  }
  
  return Array.from(tags);
};
