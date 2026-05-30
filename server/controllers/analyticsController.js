import FAQ from '../models/FAQ.js';
import Question from '../models/Question.js';

// @desc    Get dashboard analytics summary
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getAnalyticsSummary = async (req, res) => {
  try {
    // 1. Core Counts
    const totalFAQs = await FAQ.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const pendingQuestions = await Question.countDocuments({ status: 'Pending' });
    
    // Status Breakdowns
    const answeredQuestions = await Question.countDocuments({ status: { $in: ['Answered', 'AddedToFAQ'] } });
    const duplicateQuestions = await Question.countDocuments({ status: 'Duplicate' });
    const rejectedQuestions = await Question.countDocuments({ status: 'Rejected' });
    
    // 2. Most Helpful FAQs (Top 5)
    const mostHelpfulFAQs = await FAQ.find({})
      .sort({ helpfulCount: -1, question: 1 })
      .limit(5);
      
    // 3. Most Viewed FAQs (Top 5)
    const mostViewedFAQs = await FAQ.find({})
      .sort({ views: -1, question: 1 })
      .limit(5);
      
    // 4. Confusion Score FAQs (Top 5)
    const highConfusionFAQs = await FAQ.find({})
      .sort({ confusionScore: -1, question: 1 })
      .limit(5);
      
    // 5. Category Distributions (Most repeated categories for questions)
    const categoryStats = await Question.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Convert aggregation output to key-value format and ensure all standard categories exist
    const standardCategories = [
      'Offer Letter',
      'Selection Confirmation',
      'Login Issues',
      'Certificate',
      'Internship Process',
      'Technical Issues',
      'General Queries'
    ];
    
    const categoryDistribution = standardCategories.map(cat => {
      const match = categoryStats.find(stat => stat._id === cat);
      return {
        category: cat,
        count: match ? match.count : 0
      };
    }).sort((a, b) => b.count - a.count);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalFAQs,
          totalQuestions,
          pendingQuestions,
          answeredQuestions,
          duplicateQuestions,
          rejectedQuestions
        },
        mostHelpfulFAQs: mostHelpfulFAQs.map(f => ({
          _id: f._id,
          question: f.question,
          helpfulCount: f.helpfulCount,
          notHelpfulCount: f.notHelpfulCount,
          category: f.category
        })),
        mostViewedFAQs: mostViewedFAQs.map(f => ({
          _id: f._id,
          question: f.question,
          views: f.views,
          category: f.category
        })),
        highConfusionFAQs: highConfusionFAQs.map(f => ({
          _id: f._id,
          question: f.question,
          confusionScore: f.confusionScore,
          helpfulCount: f.helpfulCount,
          notHelpfulCount: f.notHelpfulCount,
          duplicateMatchCount: f.duplicateMatchCount,
          category: f.category
        })),
        categoryDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
