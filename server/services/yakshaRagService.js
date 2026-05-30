import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { preprocessText } from './similarityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FAQ_INFO_PATHS = [
  path.resolve(__dirname, '../../FAQ_info.txt'),
  path.resolve(__dirname, '../FAQ_info.txt'),
  path.resolve(__dirname, '../../../FAQ_info.txt'),
];

let ragCache = null;

export const locateFAQInfoFile = () => {
  for (const p of FAQ_INFO_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
};

export const parseFAQInfoFile = () => {
  if (ragCache) return ragCache;
  
  const filePath = locateFAQInfoFile();
  if (!filePath) {
    console.log('FAQ_info.txt not found.');
    return [];
  }
  
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');
    
    const nodes = [];
    let currentCategory = 'General';
    let currentQuestion = null;
    let currentAnswerLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check for category heading (e.g. "1. About the internship §")
      const catMatch = line.match(/^(\d+)\.\s+(.*?)(?:\s*§)?$/);
      if (catMatch) {
        currentCategory = catMatch[2].trim();
        continue;
      }
      
      // Check for question (e.g. "1.1 What is the Vicharanashala internship? §")
      const qMatch = line.match(/^(\d+\.\d+)\s+(.*?)(?:\s*§)?$/);
      if (qMatch) {
        if (currentQuestion) {
          nodes.push({
            id: currentQuestion.id,
            question: currentQuestion.text,
            answer: currentAnswerLines.join('\n').trim(),
            category: currentCategory
          });
        }
        
        currentQuestion = {
          id: qMatch[1].trim(),
          text: qMatch[2].trim()
        };
        currentAnswerLines = [];
        continue;
      }
      
      if (currentQuestion) {
        currentAnswerLines.push(line);
      }
    }
    
    if (currentQuestion) {
      nodes.push({
        id: currentQuestion.id,
        question: currentQuestion.text,
        answer: currentAnswerLines.join('\n').trim(),
        category: currentCategory
      });
    }
    
    ragCache = nodes;
    console.log(`Successfully built Yaksha Mini RAG: loaded ${nodes.length} nodes from FAQ_info.txt.`);
    return nodes;
  } catch (error) {
    console.error('Error parsing FAQ_info.txt:', error.message);
    return [];
  }
};

export const queryYakshaRag = (queryText) => {
  const nodes = parseFAQInfoFile();
  if (nodes.length === 0) {
    return {
      answer: "I'm sorry, I couldn't load the FAQ knowledge base. Please contact the administrator.",
      confidence: 0,
      matches: []
    };
  }
  
  const queryTerms = preprocessText(queryText);
  if (queryTerms.length === 0) {
    return {
      answer: "Hello! I am Yaksha Mini, your AI coordinator assistant. Ask me anything about the Vicharanashala internship policies, NOC process, offer letters, or schedules!",
      confidence: 100,
      matches: []
    };
  }
  
  const matches = [];
  
  for (const node of nodes) {
    const qTerms = preprocessText(node.question);
    const aTerms = preprocessText(node.answer);
    
    let qIntersection = queryTerms.filter(t => qTerms.includes(t)).length;
    let qUnion = new Set([...queryTerms, ...qTerms]).size;
    let qScore = qUnion > 0 ? (qIntersection / qUnion) : 0;
    
    let aIntersection = queryTerms.filter(t => aTerms.includes(t)).length;
    let aScore = queryTerms.length > 0 ? (aIntersection / queryTerms.length) : 0;
    
    const combinedScore = (qScore * 0.75) + (aScore * 0.25);
    
    if (combinedScore > 0.05) {
      matches.push({
        node,
        score: Math.round(combinedScore * 100)
      });
    }
  }
  
  matches.sort((a, b) => b.score - a.score);
  
  if (matches.length > 0 && matches[0].score >= 12) {
    const bestMatch = matches[0];
    return {
      answer: bestMatch.node.answer,
      question: bestMatch.node.question,
      id: bestMatch.node.id,
      category: bestMatch.node.category,
      confidence: bestMatch.score,
      matches: matches.slice(0, 3).map(m => ({
        id: m.node.id,
        question: m.node.question,
        category: m.node.category,
        score: m.score
      }))
    };
  }
  
  return {
    answer: "I couldn't find a high-confidence answer to your question in the Vicharanashala FAQ. Could you please rephrase or elaborate? If it is a unique query, you can submit a ticket to the coordinators or escalate in chat using the hashtag #escalate.",
    confidence: 0,
    matches: matches.slice(0, 3).map(m => ({
      id: m.node.id,
      question: m.node.question,
      category: m.node.category,
      score: m.score
    }))
  };
};
