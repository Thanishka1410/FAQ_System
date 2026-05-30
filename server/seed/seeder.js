import dotenv from 'dotenv';
import FAQ from '../models/FAQ.js';
import Question from '../models/Question.js';
import Admin from '../models/Admin.js';
import connectDB from '../config/db.js';
import { loadFAQsFromFile, locateFAQFile } from '../services/ragService.js';

dotenv.config();

const initialFAQs = [
  {
    question: 'When will I receive my offer letter?',
    answer: 'Official internship offer letters are generated in batches. Typically, you will receive your official offer letter via your registered email within 7-10 working days after selection confirmation. Please make sure to check your spam/promotions folder. If you still have not received it after 10 days, please contact the coordinator.',
    category: 'Offer Letter',
    keywords: ['offer', 'letter', 'receive', 'timing', 'delay', 'batch'],
    views: 125,
    helpfulCount: 45,
    notHelpfulCount: 2,
    duplicateMatchCount: 5,
    confusionScore: -38
  },
  {
    question: 'How do I confirm my selection?',
    answer: 'Once selected, you will receive a selection email containing a confirmation link. Click the link and complete the selection confirmation form within 3 days of receiving the email to secure your internship slot. Failure to do so may result in the slot being offered to waitlisted candidates.',
    category: 'Selection Confirmation',
    keywords: ['confirm', 'selection', 'link', 'form', 'secure', 'slot', 'waitlist'],
    views: 98,
    helpfulCount: 32,
    notHelpfulCount: 1,
    duplicateMatchCount: 2,
    confusionScore: -29
  },
  {
    question: 'I am unable to login to the portal. What should I do?',
    answer: 'If you cannot log in, please ensure you are using the registered email address and the correct temporary password provided in your selection email. Try resetting your password via the "Forgot Password" link on the login page. If you still face issues, clear your browser cache, try Incognito mode, or reach out to tech support with a screenshot of the error.',
    category: 'Login Issues',
    keywords: ['login', 'portal', 'reset', 'password', 'credentials', 'cache', 'support'],
    views: 142,
    helpfulCount: 38,
    notHelpfulCount: 8,
    duplicateMatchCount: 12,
    confusionScore: -18
  },
  {
    question: 'Where can I upload my certificate?',
    answer: 'Log in to the Samagama Portal, navigate to the "My Documents" section on the left sidebar, select the corresponding document slot (e.g. NOC, College ID, or Internship Completion), upload your certificate in PDF format (under 2MB), and click save. Our coordinators will review and approve the document within 3 working days.',
    category: 'Certificate',
    keywords: ['certificate', 'upload', 'pdf', 'document', 'noc', 'college id', 'approval'],
    views: 75,
    helpfulCount: 18,
    notHelpfulCount: 0,
    duplicateMatchCount: 1,
    confusionScore: -17
  },
  {
    question: 'How will I know whether my internship is confirmed?',
    answer: 'After you submit your selection confirmation and upload the required documents (e.g., NOC from your college), our coordinators will verify your details. Once verified, your status on the portal dashboard will update to "Internship Confirmed" and you will receive a final confirmation email containing reporting instructions.',
    category: 'Internship Process',
    keywords: ['internship', 'confirmed', 'verification', 'status', 'dashboard', 'coordinator', 'reporting'],
    views: 110,
    helpfulCount: 40,
    notHelpfulCount: 1,
    duplicateMatchCount: 3,
    confusionScore: -36
  },
  {
    question: 'What should I do if my details are incorrect?',
    answer: 'If there is a typo in your name, email, or other personal details in the portal, please go to your Profile page and click "Request Edit". Submit the corrected details along with supporting proof. The admin will review your request and update your information within 48 hours.',
    category: 'Technical Issues',
    keywords: ['incorrect', 'details', 'profile', 'typo', 'request', 'edit', 'update', 'support'],
    views: 55,
    helpfulCount: 12,
    notHelpfulCount: 3,
    duplicateMatchCount: 2,
    confusionScore: -7
  }
];

const seedData = async () => {
  try {
    await connectDB();

    // 1. Clear database
    console.log('Clearing existing data files...');
    await FAQ.deleteMany();
    await Question.deleteMany();
    await Admin.deleteMany();
    console.log('Database files cleared.');

    // 2. Seed FAQs (Scan for placed file first)
    const filePath = locateFAQFile();
    if (filePath) {
      console.log(`User placed FAQ/RAG file located at: ${filePath}. Seeding from file...`);
      const fileFAQs = loadFAQsFromFile();
      if (fileFAQs && fileFAQs.length > 0) {
        await FAQ.insertMany(fileFAQs);
        console.log(`${fileFAQs.length} FAQs loaded and seeded from local file.`);
      } else {
        console.log('FAQ file was located but empty or failed to parse. Falling back to default seeding...');
        await FAQ.insertMany(initialFAQs);
        console.log(`${initialFAQs.length} default FAQs seeded.`);
      }
    } else {
      console.log('No placed FAQ file found. Seeding default FAQs...');
      await FAQ.insertMany(initialFAQs);
      console.log(`${initialFAQs.length} default FAQs seeded.`);
    }

    // 3. Seed Default Admin
    console.log('Seeding default Admin...');
    await Admin.create({
      name: 'VLED Admin',
      email: 'admin@samagama.iitr.ac.in',
      password: 'Admin@Samagama2026',
      role: 'admin'
    });
    console.log('Default Admin seeded successfully!');
    
    // 4. Seed sample questions
    console.log('Seeding sample questions...');
    await Question.insertMany([
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        category: 'Offer Letter',
        title: 'Offer letter not received yet',
        description: 'I was selected on May 20th but have not received my offer letter in my inbox. Please help me get the letter.',
        status: 'Pending',
        tags: ['offer-letter', 'delay'],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        category: 'Certificate',
        title: 'NOC verification taking too long',
        description: 'I uploaded my No Objection Certificate 4 days ago, but the status is still showing as pending verification. When will it be verified?',
        status: 'Pending',
        tags: ['certificate', 'noc', 'verification'],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@example.com',
        category: 'Certificate',
        title: 'NOC approval is delayed',
        description: 'Uploaded my NOC letter 5 days ago, but it has not been reviewed by any coordinator yet. Please speed it up.',
        status: 'Pending',
        tags: ['certificate', 'noc', 'approval'],
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        category: 'Login Issues',
        title: 'Forgot password reset not working',
        description: 'I clicked forgot password but did not receive any reset link in my Gmail inbox. Checked spam as well.',
        status: 'Pending',
        tags: ['portal-login', 'password-reset'],
        createdAt: new Date(Date.now() - 3600000 * 10).toISOString() // 10 hours ago
      },
      {
        name: 'Priya Iyer',
        email: 'priya.iyer@example.com',
        category: 'Selection Confirmation',
        title: 'Confirming selection link shows error',
        description: 'When I click the confirm selection button in my selection email, the page says "Link Expired". How do I confirm my selection now?',
        status: 'Pending',
        tags: ['selection', 'confirmation', 'error'],
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
      }
    ]);
    console.log('Sample questions seeded.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
