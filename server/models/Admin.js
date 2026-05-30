import { readCollection, writeCollection } from '../config/db.js';
import bcrypt from 'bcryptjs';

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export class AdminInstance {
  constructor(data) {
    Object.assign(this, data);
  }
  
  async save() {
    const admins = readCollection('admins');
    const index = admins.findIndex(a => a._id === this._id);
    this.updatedAt = new Date().toISOString();
    
    if (this.password && !this.password.startsWith('$2a$')) {
      this.password = await encryptPassword(this.password);
    }
    
    if (index >= 0) {
      admins[index] = { ...this };
    } else {
      admins.push({ ...this });
    }
    writeCollection('admins', admins);
    return this;
  }
  
  async comparePassword(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

const Admin = {
  findOne: async (query) => {
    const admins = readCollection('admins');
    const admin = admins.find(a => a.email === query.email);
    if (!admin) return null;
    return new AdminInstance(admin);
  },
  
  findById: (id) => {
    const admins = readCollection('admins');
    const admin = admins.find(a => a._id === id);
    const inst = admin ? new AdminInstance(admin) : null;
    
    return {
      select: (fields) => {
        if (inst && typeof fields === 'string' && fields.startsWith('-')) {
          const excludeField = fields.slice(1);
          delete inst[excludeField];
        }
        return inst;
      },
      then: (resolve) => resolve(inst)
    };
  },
  
  create: async (data) => {
    const admins = readCollection('admins');
    const _id = 'admin_' + Math.random().toString(36).substr(2, 9);
    const newAdmin = {
      _id,
      role: 'admin',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    newAdmin.password = await encryptPassword(newAdmin.password);
    admins.push(newAdmin);
    writeCollection('admins', admins);
    return new AdminInstance(newAdmin);
  },
  
  deleteMany: async () => {
    writeCollection('admins', []);
    return { deletedCount: 0 };
  }
};

export default Admin;
