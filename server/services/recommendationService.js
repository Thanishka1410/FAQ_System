import { calculateMatchScore } from './similarityService.js';

/**
 * Cluster similar pending questions to identify frequent queries that aren't yet in the FAQ.
 * @param {Array} pendingQuestions - List of pending question objects from DB
 * @param {number} similarityThreshold - Similarity percentage to cluster (default 60)
 * @returns {Array} List of FAQ recommendations
 */
export const getFAQRecommendations = (pendingQuestions, similarityThreshold = 60) => {
  if (pendingQuestions.length === 0) return [];
  
  const visited = new Set();
  const recommendations = [];
  
  for (let i = 0; i < pendingQuestions.length; i++) {
    const q1 = pendingQuestions[i];
    if (visited.has(q1._id.toString())) continue;
    
    const cluster = [q1];
    visited.add(q1._id.toString());
    
    // Find all other pending questions that match q1
    for (let j = i + 1; j < pendingQuestions.length; j++) {
      const q2 = pendingQuestions[j];
      if (visited.has(q2._id.toString())) continue;
      
      // Compare titles/descriptions using our similarity service
      // We simulate a mock FAQ format from q2 to compare with q1
      const query1 = { title: q1.title, description: q1.description, category: q1.category };
      const pseudoFaq2 = { question: q2.title, answer: q2.description, category: q2.category, keywords: q2.tags || [] };
      
      const score = calculateMatchScore(query1, pseudoFaq2);
      
      if (score >= similarityThreshold) {
        cluster.push(q2);
        visited.add(q2._id.toString());
      }
    }
    
    // If we have multiple similar questions, recommend them!
    if (cluster.length >= 2) {
      // Pick the most detailed/longest title from the cluster as the recommended FAQ question
      const representative = cluster.reduce((longest, current) => 
        current.title.length > longest.title.length ? current : longest
      , cluster[0]);
      
      recommendations.push({
        representativeQuestion: representative.title,
        category: representative.category,
        count: cluster.length,
        questionIds: cluster.map(q => q._id),
        sampleQuestions: cluster.map(q => ({
          id: q._id,
          name: q.name,
          title: q.title,
          description: q.description
        })),
        reason: `Found ${cluster.length} similar pending questions in '${representative.category}' about this topic.`
      });
    }
  }
  
  // Sort recommendations by count descending (most popular recommendation first)
  return recommendations.sort((a, b) => b.count - a.count);
};
