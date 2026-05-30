import Question from '../models/Question.js';
import FAQ from '../models/FAQ.js';
import { findSimilarFAQs } from '../services/similarityService.js';
import { generateTags } from '../services/taggingService.js';
import { getFAQRecommendations } from '../services/recommendationService.js';

// @desc    Check for similar/duplicate FAQs
// @route   POST /api/questions/check-duplicate
// @access  Public
export const checkDuplicateQuestions = async (req, res) => {
  const { title, description, category } = req.body;
  
  try {
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide a question title' });
    }
    
    const faqs = await FAQ.find({});
    
    // Find similarity using our service
    const matches = findSimilarFAQs({ title, description, category }, faqs, 25);
    
    // Check if there is a super high similarity match (>80%)
    const hasHighMatch = matches.length > 0 && matches[0].score >= 80;
    
    res.json({
      success: true,
      hasHighMatch,
      highMatchThreshold: 80,
      matches: matches.map(m => ({
        _id: m.faq._id,
        question: m.faq.question,
        answer: m.faq.answer,
        category: m.faq.category,
        score: m.score
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit a new question
// @route   POST /api/questions
// @access  Public
export const submitQuestion = async (req, res) => {
  const { name, email, category, title, description, screenshotUrl } = req.body;
  
  try {
    if (!name || !email || !category || !title || !description) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }
    
    const faqs = await FAQ.find({});
    const matches = findSimilarFAQs({ title, description, category }, faqs, 25);
    
    // Strict block if there is a match of >= 80% (direct duplicate)
    const directDuplicate = matches.find(m => m.score >= 80);
    if (directDuplicate) {
      return res.status(400).json({
        success: false,
        message: 'This question is a direct duplicate of an existing FAQ. Please read the matching answer below.',
        duplicateFaq: directDuplicate.faq
      });
    }
    
    // Auto-generate tags using our service
    const autoTags = generateTags(title, description, category);
    
    // Extract matched FAQ IDs to link in Question
    const matchedFAQIds = matches.map(m => m.faq._id);
    
    // Increment duplicate match count for similar FAQs to update their trending and confusion scores
    for (const m of matches) {
      if (m.score >= 40) { // Only increment if similarity is moderate to high
        await FAQ.findByIdAndUpdate(m.faq._id, { $inc: { duplicateMatchCount: 1 } });
      }
    }
    
    const newQuestion = await Question.create({
      name,
      email,
      category,
      title,
      description,
      screenshotUrl: screenshotUrl || '',
      status: 'Pending',
      matchedFAQIds,
      tags: autoTags
    });
    
    res.status(201).json({
      success: true,
      message: 'Question submitted successfully and is currently pending review.',
      data: newQuestion
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all questions (with filters)
// @route   GET /api/questions
// @access  Private/Admin
export const getQuestions = async (req, res) => {
  const { category, status } = req.query;
  
  try {
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    
    const questions = await Question.find(query)
      .populate('matchedFAQIds', 'question category')
      .sort({ createdAt: -1 });
      
    // Auto FAQ Recommendation logic
    // We fetch all pending questions and run our clustering algorithm to generate tips for the admin
    const pendingQuestions = await Question.find({ status: 'Pending' });
    const recommendations = getFAQRecommendations(pendingQuestions, 60);
    
    res.json({
      success: true,
      count: questions.length,
      recommendations, // Send recommendations along for the admin panel
      data: questions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single question
// @route   GET /api/questions/:id
// @access  Private/Admin
export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const question = await Question.findById(id).populate('matchedFAQIds');
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Answer a question and optionally promote to FAQ
// @route   PUT /api/questions/:id/answer
// @access  Private/Admin
export const answerQuestion = async (req, res) => {
  const { id } = req.params;
  const { answer, addToFAQ } = req.body;
  
  try {
    if (!answer) {
      return res.status(400).json({ success: false, message: 'Please provide an answer' });
    }
    
    let question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    question.answer = answer;
    question.status = 'Answered';
    
    let createdFaq = null;
    
    // If Admin chooses to add this directly to FAQ
    if (addToFAQ) {
      question.status = 'AddedToFAQ';
      
      // Auto-keywords from title
      const cleanKeywords = generateTags(question.title, question.description, question.category);
      
      createdFaq = await FAQ.create({
        question: question.title,
        answer: answer,
        category: question.category,
        keywords: cleanKeywords,
        views: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        duplicateMatchCount: 0,
        confusionScore: 0
      });
    }
    
    await question.save();
    
    res.json({
      success: true,
      message: addToFAQ ? 'Question answered and added directly to FAQs!' : 'Question answered successfully.',
      data: question,
      faq: createdFaq
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a question's status (Duplicate, Rejected)
// @route   PUT /api/questions/:id/status
// @access  Private/Admin
export const updateQuestionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const validStatuses = ['Pending', 'Answered', 'Duplicate', 'AddedToFAQ', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    let question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    question.status = status;
    await question.save();
    
    res.json({
      success: true,
      message: `Question status updated to ${status}.`,
      data: question
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;
  
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    await Question.findByIdAndDelete(id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
