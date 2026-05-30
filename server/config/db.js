import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');

// Synchronously ensure data directory exists
export const initDB = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

export const readCollection = (collectionName) => {
  initDB();
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error.message);
    return [];
  }
};

export const writeCollection = (collectionName, data) => {
  initDB();
  const filePath = path.join(DATA_DIR, `${collectionName}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing collection ${collectionName}:`, error.message);
  }
};

const connectDB = async () => {
  initDB();
  console.log(`Connecting to local JSON file-based database at: ${DATA_DIR}`);
  console.log('Database Connected successfully in LITE prototype mode!');
};

export default connectDB;

// Helper to check if a document matches the query schema
export const matchesQuery = (item, query) => {
  if (!query || Object.keys(query).length === 0) return true;
  
  for (const key in query) {
    if (key === '$or') {
      const orConditions = query[key];
      if (!Array.isArray(orConditions)) continue;
      const matchedSome = orConditions.some(cond => {
        for (const subKey in cond) {
          const val = cond[subKey];
          const itemVal = item[subKey];
          
          if (val instanceof RegExp) {
            if (typeof itemVal === 'string' && val.test(itemVal)) return true;
          } else if (val && typeof val === 'object' && '$in' in val) {
            const inList = val.$in;
            if (Array.isArray(itemVal)) {
              return itemVal.some(elem => inList.some(rx => rx instanceof RegExp ? rx.test(elem) : elem === rx));
            }
          } else {
            if (itemVal === val) return true;
            if (Array.isArray(itemVal) && itemVal.includes(val)) return true;
          }
        }
        return false;
      });
      if (!matchedSome) return false;
    } else {
      const val = query[key];
      const itemVal = item[key];
      
      if (val && typeof val === 'object') {
        if ('$in' in val) {
          const inList = val.$in;
          if (Array.isArray(itemVal)) {
            if (!itemVal.some(elem => inList.includes(elem))) return false;
          } else {
            if (!inList.includes(itemVal)) return false;
          }
        } else if (val instanceof RegExp) {
          if (typeof itemVal !== 'string' || !val.test(itemVal)) return false;
        } else {
          if (JSON.stringify(itemVal) !== JSON.stringify(val)) return false;
        }
      } else {
        if (itemVal !== val) return false;
      }
    }
  }
  return true;
};

// Chained Query Builder mimicking Mongoose queries
export class MockQuery {
  constructor(data, filterFn, collectionName, createInstance) {
    this.data = data;
    this.filterFn = filterFn;
    this.collectionName = collectionName;
    this.createInstance = createInstance;
    this._sortObj = null;
    this._limitNum = null;
    this._populateFields = [];
    this._selectFields = null;
  }
  
  sort(sortObj) {
    this._sortObj = sortObj;
    return this;
  }
  
  limit(limitNum) {
    this._limitNum = limitNum;
    return this;
  }
  
  populate(field, selectFields) {
    this._populateFields.push({ field, selectFields });
    return this;
  }
  
  select(fields) {
    this._selectFields = fields;
    return this;
  }
  
  async execute() {
    let results = this.data.filter(this.filterFn);
    
    // Sort
    if (this._sortObj) {
      results.sort((a, b) => {
        for (const key in this._sortObj) {
          const order = this._sortObj[key];
          let valA = a[key];
          let valB = b[key];
          
          if (key === 'createdAt' || key === 'updatedAt') {
            valA = new Date(valA || 0).getTime();
            valB = new Date(valB || 0).getTime();
          } else if (typeof valA === 'string' && typeof valB === 'string') {
            const cmp = valA.localeCompare(valB);
            if (cmp !== 0) return order === -1 ? -cmp : cmp;
          }
          
          if (valA < valB) return order === -1 ? 1 : -1;
          if (valA > valB) return order === -1 ? -1 : 1;
        }
        return 0;
      });
    }
    
    // Limit
    if (this._limitNum !== null) {
      results = results.slice(0, this._limitNum);
    }
    
    // Map to instances so save() is available
    let instances = results.map(item => this.createInstance(item));
    
    // Populate
    if (this._populateFields.length > 0) {
      for (const pop of this._populateFields) {
        const { field } = pop;
        for (const inst of instances) {
          if (field === 'matchedFAQIds') {
            const ids = inst.matchedFAQIds || [];
            const faqs = readCollection('faqs');
            inst.matchedFAQIds = ids.map(id => {
              const matchedFaq = faqs.find(f => f._id.toString() === id.toString());
              return matchedFaq ? matchedFaq : null;
            }).filter(Boolean);
          }
        }
      }
    }
    
    // Select (like password exclusion)
    if (this._selectFields) {
      if (typeof this._selectFields === 'string' && this._selectFields.startsWith('-')) {
        const excludeField = this._selectFields.slice(1);
        instances.forEach(inst => {
          delete inst[excludeField];
        });
      }
    }
    
    return instances;
  }
  
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
}
