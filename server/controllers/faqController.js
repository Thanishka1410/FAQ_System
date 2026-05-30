import FAQ from '../models/FAQ.js';
import { preprocessText } from '../services/similarityService.js';
import { syncFAQsWithFile } from '../services/ragService.js';

// @desc    Get all FAQs (supports filtering, sorting by trending/confusion)
// @route   GET /api/faqs
// @access  Public
export const getFAQs = async (req, res) => {
  const { category, sort } = req.query;
  
  try {
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    
    let faqQuery = FAQ.find(query);
    
    // Sort logic
    if (sort === 'trending') {
      // Custom trending sort: score = views + duplicateMatchCount * 3
      // We will perform a Mongoose aggregation, or simple javascript sorting if collection is small,
      // or we can sort by views descending as a DB-level fallback. Let's do a programmatic sort.
      const faqs = await faqQuery;
      const sortedFaqs = faqs.sort((a, b) => {
        const trendA = a.views + (a.duplicateMatchCount * 3);
        const trendB = b.views + (b.duplicateMatchCount * 3);
        return trendB - trendA;
      });
      return res.json({ success: true, count: sortedFaqs.length, data: sortedFaqs });
    } else if (sort === 'confusion') {
      faqQuery = faqQuery.sort({ confusionScore: -1 });
    } else {
      faqQuery = faqQuery.sort({ createdAt: -1 });
    }
    
    const faqs = await faqQuery;
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search FAQs by keyword
// @route   GET /api/faqs/search
// @access  Public
export const searchFAQs = async (req, res) => {
  const { q, category } = req.query;
  
  try {
    if (!q) {
      return getFAQs(req, res);
    }
    
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Text search or regex matching
    // Let's search in question, answer, and keywords using regular expressions (case insensitive)
    const searchRegex = new RegExp(q, 'i');
    query.$or = [
      { question: searchRegex },
      { answer: searchRegex },
      { keywords: { $in: [searchRegex] } }
    ];
    
    const faqs = await FAQ.find(query).sort({ views: -1 });
    res.json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
export const createFAQ = async (req, res) => {
  const { question, answer, category, keywords } = req.body;
  
  try {
    if (!question || !answer || !category) {
      return res.status(400).json({ success: false, message: 'Please provide question, answer, and category' });
    }
    
    // Auto-generate keywords from question text if not provided
    const autoKeywords = keywords && keywords.length > 0
      ? keywords 
      : preprocessText(question);
      
    const faq = await FAQ.create({
      question,
      answer,
      category,
      keywords: autoKeywords,
    });
    
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer, category, keywords } = req.body;
  
  try {
    let faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    
    if (question) faq.question = question;
    if (answer) faq.answer = answer;
    if (category) faq.category = category;
    if (keywords) faq.keywords = keywords;
    
    // Recompute keywords if question changed and keywords weren't modified explicitly
    if (question && (!keywords || keywords.length === 0)) {
      faq.keywords = preprocessText(question);
    }
    
    await faq.save();
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFAQ = async (req, res) => {
  const { id } = req.params;
  
  try {
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    
    await FAQ.findByIdAndDelete(id);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment helpfulCount
// @route   POST /api/faqs/:id/helpful
// @access  Public
export const markHelpful = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    
    faq.helpfulCount += 1;
    await faq.save(); // pre-save will automatically update confusionScore
    
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment notHelpfulCount
// @route   POST /api/faqs/:id/not-helpful
// @access  Public
export const markNotHelpful = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    
    faq.notHelpfulCount += 1;
    await faq.save(); // pre-save will automatically update confusionScore
    
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment views count
// @route   POST /api/faqs/:id/view
// @access  Public
export const recordView = async (req, res) => {
  const { id } = req.params;
  try {
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    
    faq.views += 1;
    await faq.save();
    
    res.json({ success: true, data: faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync FAQs from local file
// @route   POST /api/faqs/sync-file
// @access  Private/Admin
export const syncLocalFAQFile = async (req, res) => {
  try {
    const result = await syncFAQsWithFile();
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

