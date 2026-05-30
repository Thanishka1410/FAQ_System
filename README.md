# Samagama FAQ Portal 🌟

An intelligent, crowd-sourced FAQ management system for the **Samagama Internship Program** under **VLED Lab, IIT Ropar**. 

Designed to optimize coordinator productivity and streamline intern onboarding, the portal uses real-time local text matching, auto-tagging, clustering algorithms, and dynamic admin dashboard stats to reduce repetitive questions.

---

## 🚀 Key Features

### Public Portal
1. **Browse FAQs Grid**: Interactive accordion view of all active FAQs, categorized with clean color-coded badges, view count logs, and helpfulness upvote/downvote signals.
2. **Dynamic Search & Filters**: Live search through questions, answers, and tags, with quick horizontal scroll category filters.
3. **Ask a Question Form**: Submits a ticket with Name, Email, Category, and Details. 
4. **Live Similarity Checker**:
   - As the user types their question, it runs a **Weighted Jaccard Keyword Matching Algorithm** to detect similar FAQs.
   - Shows similar answers inline to prevent ticket creation.
   - **Blocks Submissions** if the match score is greater than **80%** (strict duplicate prevention).

### Admin Portal (JWT Protected)
1. **Pending Question Table**: Clean queue representing pending tickets, accessible as a structured grid on desktop and premium responsive swipe cards on mobile.
2. **In-Queue Resolutions**: Modal prompt allowing coordinates to write answers and optionally **promote to the public FAQ directory in one click**.
3. **Auto FAQ Clustering Recommendations**: Automatically clusters pending questions using a keyword overlap algorithm and alerts coordinates: *"Suggested FAQ: This topic is repeatedly asked."*
4. **Local RAG Placed-File Sync**: Parses placed documents (`faqs.json` or `faqs.txt`) and indices them automatically. Admins can sync from the UI instantly.
5. **Analytics Dashboard**:
   - Total counters (FAQs, Pending tickets, Resolved, Blocked Duplicates, Rejected).
   - High Confusion Score logs: `Confusion = NotHelpful + DuplicateMatches - Helpful`. High scores indicate a FAQ card needs coordinate review.
   - Visual progress indicators for category frequencies and views.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Tailwind CSS v3, Axios, React Router v6, Lucide React (Icons), Inter Google Font.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB (Local or Atlas).
- **Security**: JWT tokens stored in localStorage, bcryptjs hashing for Admin credentials.
- **RAG Services**: Local file reader for `.json` and structured `.txt` files.

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/samagama_faq
JWT_SECRET=samagama_secret_2026_vled_lab
NODE_ENV=development
```

---

## 📖 How to Placed Files for RAG Syncing

You can drop your customized FAQs as a file in the project folder to populate or sync databases.
Supported formats:

1. **`faqs.json`** (Placed in project root or `server/`):
   ```json
   [
     {
       "question": "Can I request a stipend advance?",
       "answer": "Stipend payments are processed only at the end of the monthly cycle upon verification of your milestone approvals.",
       "category": "Internship Process",
       "keywords": ["stipend", "advance", "payment"]
     }
   ]
   ```

2. **`faqs.txt`** (Placed in project root or `server/`):
   ```text
   Q: Can I change my allocated mentor?
   A: Mentor modifications are permitted only within the first 5 working days of the cohort upon coordinator approval.
   Category: Internship Process
   Keywords: mentor, change, allocate

   Q: How do I submit my weekly milestone report?
   A: Submit your weekly reports through the Samagama dashboard portal before Friday 5:00 PM.
   Category: Technical Issues
   Keywords: report, milestone, weekly
   ```

Admins can click the **"Sync RAG File"** button in their "Manage FAQs" dashboard tab to index these.

---

## 🏃 How to Run the Project

### Prerequisites
Make sure **Node.js** (v18+) and **MongoDB** are installed and running locally.

### Step 1: Database Seeding
Open your terminal at the root of the project, navigate to `server/`, and seed the databases:
```bash
cd server
npm run seed
```
This seeds the initial 6 VLED Lab FAQs, a set of sample questions to populate dashboard indicators, and the default admin user:
- **Email**: `admin@samagama.iitr.ac.in`
- **Password**: `Admin@Samagama2026`

### Step 2: Running Backend Server
```bash
npm run dev
```
The server will boot up at `http://localhost:5000`.

### Step 3: Running Frontend Client
Open a second terminal window, navigate to the `client/` folder, install modules, and run the hot-reloading server:
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔮 Future Expansion Roadmaps
1. **Vector-Search Semantic Matching**: Integrate Milvus/Pinecone alongside local embeddings (e.g. Transformers.js) to detect duplicates based on semantic meaning instead of keywords.
2. **AI Answer Generation**: Employ local/cloud LLMs to draft answers for coordinates based on indexed RAG files before they review and publish.
3. **Multilingual FAQ Interface**: Add translation triggers (Hindi/English) to help diverse student cohorts easily search documents.
