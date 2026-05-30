import { readCollection, writeCollection, matchesQuery, MockQuery } from '../config/db.js';

export class QuestionInstance {
  constructor(data) {
    Object.assign(this, data);
  }
  
  async save() {
    this.updatedAt = new Date().toISOString();
    
    const questions = readCollection('questions');
    const index = questions.findIndex(q => q._id.toString() === this._id.toString());
    if (index >= 0) {
      questions[index] = { ...this };
    } else {
      questions.push({ ...this });
    }
    writeCollection('questions', questions);
    return this;
  }
}

const Question = {
  find: (query) => {
    const questions = readCollection('questions');
    const filterFn = (item) => matchesQuery(item, query);
    return new MockQuery(questions, filterFn, 'questions', (item) => new QuestionInstance(item));
  },
  
  findById: async (id) => {
    const questions = readCollection('questions');
    const question = questions.find(q => q._id.toString() === id.toString());
    if (!question) return null;
    return new QuestionInstance(question);
  },
  
  findByIdAndUpdate: async (id, update) => {
    const questions = readCollection('questions');
    const index = questions.findIndex(q => q._id.toString() === id.toString());
    if (index === -1) return null;
    
    let question = questions[index];
    if (update.$inc) {
      for (const field in update.$inc) {
        question[field] = (question[field] || 0) + update.$inc[field];
      }
    }
    if (update.$set) {
      Object.assign(question, update.$set);
    }
    
    for (const key in update) {
      if (key !== '$inc' && key !== '$set') {
        question[key] = update[key];
      }
    }
    
    question.updatedAt = new Date().toISOString();
    questions[index] = question;
    writeCollection('questions', questions);
    return new QuestionInstance(question);
  },
  
  create: async (data) => {
    const questions = readCollection('questions');
    const _id = 'question_' + Math.random().toString(36).substr(2, 9);
    
    const newQuestion = {
      _id,
      status: 'Pending',
      answer: '',
      tags: [],
      matchedFAQIds: [],
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    questions.push(newQuestion);
    writeCollection('questions', questions);
    return new QuestionInstance(newQuestion);
  },
  
  countDocuments: async (query) => {
    const questions = readCollection('questions');
    if (!query || Object.keys(query).length === 0) return questions.length;
    return questions.filter(item => matchesQuery(item, query)).length;
  },
  
  deleteMany: async () => {
    writeCollection('questions', []);
    return { deletedCount: 0 };
  },
  
  insertMany: async (array) => {
    const questions = readCollection('questions');
    const prepared = array.map(item => {
      const _id = item._id || 'question_' + Math.random().toString(36).substr(2, 9);
      return {
        _id,
        status: 'Pending',
        answer: '',
        tags: [],
        matchedFAQIds: [],
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    
    questions.push(...prepared);
    writeCollection('questions', questions);
    return prepared.map(q => new QuestionInstance(q));
  },
  
  findByIdAndDelete: async (id) => {
    const questions = readCollection('questions');
    const index = questions.findIndex(q => q._id.toString() === id.toString());
    if (index === -1) return null;
    const deleted = questions.splice(index, 1)[0];
    writeCollection('questions', questions);
    return new QuestionInstance(deleted);
  },
  
  aggregate: async (pipeline) => {
    const questions = readCollection('questions');
    const groups = {};
    for (const q of questions) {
      const cat = q.category;
      if (cat) {
        groups[cat] = (groups[cat] || 0) + 1;
      }
    }
    const result = Object.keys(groups).map(cat => ({
      _id: cat,
      count: groups[cat]
    }));
    result.sort((a, b) => b.count - a.count);
    return result;
  }
};

export default Question;
