import { queryYakshaRag, parseFAQInfoFile, locateFAQInfoFile } from '../services/yakshaRagService.js';

// @desc    Query Yaksha Mini RAG
// @route   POST /api/yaksha-mini/query
// @access  Public
export const queryYaksha = async (req, res) => {
  const { query } = req.body;
  
  try {
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }
    
    const result = queryYakshaRag(query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Yaksha Mini status
// @route   GET /api/yaksha-mini/status
// @access  Public (so both public and admin dashboard can view it)
export const getYakshaStatus = async (req, res) => {
  try {
    const filePath = locateFAQInfoFile();
    const isIndexed = filePath !== null;
    const nodes = isIndexed ? parseFAQInfoFile() : [];
    
    // Group categories count
    const categoryCounts = {};
    nodes.forEach(node => {
      categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;
    });
    
    const categoriesList = Object.keys(categoryCounts).map(cat => ({
      name: cat,
      count: categoryCounts[cat]
    }));
    
    res.json({
      success: true,
      data: {
        isIndexed,
        fileName: isIndexed ? 'FAQ_info.txt' : null,
        filePath: filePath,
        totalSegments: nodes.length,
        categories: categoriesList,
        previewSegments: nodes.slice(0, 10).map(node => ({
          id: node.id,
          question: node.question,
          category: node.category
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
