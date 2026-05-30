import { readCollection, writeCollection, matchesQuery, MockQuery } from '../config/db.js';
import { preprocessText } from '../services/similarityService.js';

export class FAQInstance {
  constructor(data) {
    Object.assign(this, data);
  }
  
  async save() {
    this.confusionScore = (this.notHelpfulCount || 0) + (this.duplicateMatchCount || 0) - (this.helpfulCount || 0);
    this.updatedAt = new Date().toISOString();
    
    const faqs = readCollection('faqs');
    const index = faqs.findIndex(f => f._id.toString() === this._id.toString());
    if (index >= 0) {
      faqs[index] = { ...this };
    } else {
      faqs.push({ ...this });
    }
    writeCollection('faqs', faqs);
    return this;
  }
}

const FAQ = {
  find: (query) => {
    const faqs = readCollection('faqs');
    const filterFn = (item) => matchesQuery(item, query);
    return new MockQuery(faqs, filterFn, 'faqs', (item) => new FAQInstance(item));
  },
  
  findById: async (id) => {
    const faqs = readCollection('faqs');
    const faq = faqs.find(f => f._id.toString() === id.toString());
    if (!faq) return null;
    return new FAQInstance(faq);
  },
  
  findByIdAndUpdate: async (id, update) => {
    const faqs = readCollection('faqs');
    const index = faqs.findIndex(f => f._id.toString() === id.toString());
    if (index === -1) return null;
    
    let faq = faqs[index];
    if (update.$inc) {
      for (const field in update.$inc) {
        faq[field] = (faq[field] || 0) + update.$inc[field];
      }
    }
    if (update.$set) {
      Object.assign(faq, update.$set);
    }
    
    for (const key in update) {
      if (key !== '$inc' && key !== '$set') {
        faq[key] = update[key];
      }
    }
    
    faq.confusionScore = (faq.notHelpfulCount || 0) + (faq.duplicateMatchCount || 0) - (faq.helpfulCount || 0);
    faq.updatedAt = new Date().toISOString();
    
    faqs[index] = faq;
    writeCollection('faqs', faqs);
    return new FAQInstance(faq);
  },
  
  create: async (data) => {
    const faqs = readCollection('faqs');
    const _id = 'faq_' + Math.random().toString(36).substr(2, 9);
    
    const autoKeywords = data.keywords && data.keywords.length > 0
      ? data.keywords 
      : preprocessText(data.question || '');
      
    const newFaq = {
      _id,
      views: 0,
      helpfulCount: 0,
      notHelpfulCount: 0,
      duplicateMatchCount: 0,
      confusionScore: 0,
      ...data,
      keywords: autoKeywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    newFaq.confusionScore = newFaq.notHelpfulCount + newFaq.duplicateMatchCount - newFaq.helpfulCount;
    
    faqs.push(newFaq);
    writeCollection('faqs', faqs);
    return new FAQInstance(newFaq);
  },
  
  countDocuments: async (query) => {
    const faqs = readCollection('faqs');
    if (!query || Object.keys(query).length === 0) return faqs.length;
    return faqs.filter(item => matchesQuery(item, query)).length;
  },
  
  deleteMany: async () => {
    writeCollection('faqs', []);
    return { deletedCount: 0 };
  },
  
  insertMany: async (array) => {
    const faqs = readCollection('faqs');
    const prepared = array.map(item => {
      const _id = item._id || 'faq_' + Math.random().toString(36).substr(2, 9);
      const autoKeywords = item.keywords && item.keywords.length > 0
        ? item.keywords 
        : preprocessText(item.question || '');
      
      const f = {
        _id,
        views: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        duplicateMatchCount: 0,
        confusionScore: 0,
        ...item,
        keywords: autoKeywords,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      f.confusionScore = f.notHelpfulCount + f.duplicateMatchCount - f.helpfulCount;
      return f;
    });
    
    faqs.push(...prepared);
    writeCollection('faqs', faqs);
    return prepared.map(f => new FAQInstance(f));
  },
  
  findByIdAndDelete: async (id) => {
    const faqs = readCollection('faqs');
    const index = faqs.findIndex(f => f._id.toString() === id.toString());
    if (index === -1) return null;
    const deleted = faqs.splice(index, 1)[0];
    writeCollection('faqs', faqs);
    return new FAQInstance(deleted);
  },
  
  findOne: async (query) => {
    const faqs = readCollection('faqs');
    const faq = faqs.find(f => matchesQuery(f, query));
    if (!faq) return null;
    return new FAQInstance(faq);
  }
};

export default FAQ;
