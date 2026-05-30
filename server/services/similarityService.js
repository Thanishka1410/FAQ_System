const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'cant', 'cannot', 'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont',
  'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have',
  'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in', 'into', 'is', 'isnt',
  'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out',
  'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some',
  'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent',
  'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why',
  'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your',
  'yours', 'yourself', 'yourselves', 'please', 'help', 'get', 'want', 'need', 'i am', 'unable', 'to',
  'how do', 'can i', 'how to'
]);

/**
 * Preprocesses a string by converting it to lowercase, stripping punctuation, and filtering out stop words.
 * @param {string} text 
 * @returns {string[]} Array of clean, meaningful terms
 */
export const preprocessText = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove punctuation except hyphens
    .split(/\s+/) // split on spaces
    .map(word => word.trim())
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
};

/**
 * Computes Jaccard Similarity between two sets of terms.
 * Jaccard = size of intersection / size of union
 * @param {string[]} termsA 
 * @param {string[]} termsB 
 * @returns {number} Score between 0 and 1
 */
const calculateJaccard = (termsA, termsB) => {
  if (termsA.length === 0 || termsB.length === 0) return 0;
  const setA = new Set(termsA);
  const setB = new Set(termsB);
  
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
};

/**
 * Calculates a match score between a user question and a single FAQ card.
 * Uses a weighted combination of question overlap, answer overlap, keywords, and category check.
 * @param {object} userQuery - { title, description, category }
 * @param {object} faq - { question, answer, category, keywords }
 * @returns {number} Match score percentage (0 - 100)
 */
export const calculateMatchScore = (userQuery, faq) => {
  const queryTitleTerms = preprocessText(userQuery.title);
  const queryDescTerms = preprocessText(userQuery.description || '');
  const queryAllTerms = [...new Set([...queryTitleTerms, ...queryDescTerms])];
  
  const faqQuestionTerms = preprocessText(faq.question);
  const faqAnswerTerms = preprocessText(faq.answer);
  const faqKeywordsTerms = faq.keywords.flatMap(kw => preprocessText(kw));
  
  // 1. Question similarity (Jaccard on Title vs FAQ Question)
  // Higher weight since title contains the core question
  const titleFaqQuestionJaccard = calculateJaccard(queryTitleTerms, faqQuestionTerms);
  const fullFaqQuestionJaccard = calculateJaccard(queryAllTerms, faqQuestionTerms);
  const questionScore = Math.max(titleFaqQuestionJaccard * 1.2, fullFaqQuestionJaccard); // bonus for title match
  
  // 2. Answer overlap: check what % of user query terms are present in the FAQ answer
  let answerMatches = 0;
  if (queryTitleTerms.length > 0) {
    const faqAnswerSet = new Set(faqAnswerTerms);
    queryTitleTerms.forEach(term => {
      if (faqAnswerSet.has(term)) answerMatches++;
    });
  }
  const answerScore = queryTitleTerms.length > 0 ? (answerMatches / queryTitleTerms.length) : 0;
  
  // 3. Keyword matching
  let keywordMatches = 0;
  if (queryTitleTerms.length > 0 && faqKeywordsTerms.length > 0) {
    const faqKeywordsSet = new Set(faqKeywordsTerms);
    queryTitleTerms.forEach(term => {
      if (faqKeywordsSet.has(term)) keywordMatches++;
    });
  }
  const keywordScore = queryTitleTerms.length > 0 && faqKeywordsTerms.length > 0 
    ? (keywordMatches / Math.max(queryTitleTerms.length, 1)) 
    : 0;
    
  // 4. Category Match
  const categoryScore = (userQuery.category && faq.category && 
    userQuery.category.toLowerCase() === faq.category.toLowerCase()) ? 1.0 : 0.0;
    
  // Weighted Score
  // Weights: Question = 0.55, Answer = 0.15, Keywords = 0.15, Category = 0.15
  const weightedScore = 
    (Math.min(questionScore, 1.0) * 0.55) + 
    (Math.min(answerScore, 1.0) * 0.15) + 
    (Math.min(keywordScore, 1.0) * 0.15) + 
    (categoryScore * 0.15);
    
  // Return percentage rounded to two decimal places
  return Math.round(weightedScore * 100);
};

/**
 * Scans all active FAQs and returns a list of matching FAQs with similarity score above a threshold.
 * @param {object} userQuery - { title, description, category }
 * @param {Array} faqs - Array of FAQ objects from database
 * @param {number} minThreshold - Minimum percentage score (default 25%)
 * @returns {Array} Matches sorted by similarity score descending
 */
export const findSimilarFAQs = (userQuery, faqs, minThreshold = 25) => {
  if (!userQuery.title) return [];
  
  return faqs
    .map(faq => {
      const score = calculateMatchScore(userQuery, faq);
      return { faq, score };
    })
    .filter(match => match.score >= minThreshold)
    .sort((a, b) => b.score - a.score);
};
