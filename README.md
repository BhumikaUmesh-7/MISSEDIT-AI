# MissedIt AI

> **Catch up in minutes. Miss nothing important.**
> A responsive, privacy-conscious conversation intelligence application that converts lengthy unread WhatsApp group chats into prioritized briefings, action items, key decisions, mentions, and deadlines.

---

## 1. Problem Statement: “What Did I Miss?”

People frequently return to busy WhatsApp group chats, hackathon teams, student project threads, and community discussions after being away, only to find hundreds of unread messages. Hidden inside this noise are critical announcements, decisions, deliverables, deadlines, and questions that directly impact them.

Reading every single message wastes valuable time and critical updates get lost. **MissedIt AI** solves this by answering the 8 key questions in seconds:
1. **What happened in the conversation?** (Extractive Executive Briefing & discussion themes)
2. **What are the most important messages?** (Urgent & Important Priority Inbox with deterministic scoring)
3. **What decisions were made?** (Key decisions, approvals, and meeting shifts with confidence ratings)
4. **What tasks are assigned to me?** (Action items classified into "Assigned to me", "Assigned to others", and "Unclear")
5. **What deadlines are approaching?** (Deadlines grouped into Due Today, Upcoming, and Overdue)
6. **Which messages mention me?** (Direct @mentions and personalized questions)
7. **Which messages require my reply?** (Unanswered inquiries and confirmation requests)
8. **What should I do first?** (Ranked Top 3 Recommended Next Actions)

---

## 2. WhatsApp Integration Architecture

### Option A: Import WhatsApp Chat Export (`.txt`) — Recommended & Fully Working
MissedIt AI implements a tolerant in-browser parser for standard exported chat files:
1. Open WhatsApp on your phone or web.
2. Open any individual or group conversation.
3. Tap **Group Info** or the **Three Dots Menu (⋮)** &rarr; **More** &rarr; **Export Chat**.
4. Select **Without Media**.
5. Save the resulting `.txt` file.
6. In MissedIt AI, click **"Import WhatsApp Chat"** or drag-and-drop the file.
7. Inspect the preview of detected speakers and message count.
8. (Optional) Provide your name to prioritize tasks and mentions assigned to you.
9. Click **"Analyze Conversation"** to generate the full intelligence report.

#### Supported WhatsApp Formats:
- Standard hyphen: `12/10/2026, 10:30 AM - Rahul: Message`
- Bracketed iOS/Web: `[12/10/2026, 10:32 AM] Priya: Message`
- 24-hour military times: `10/12/26, 22:30 - Arun: Message`
- Multiline messages: continuation lines are automatically grouped with the parent message.
- System notifications: encryption notices, participant additions/removals, and subject changes are parsed separately.
- Tolerant fallback: unformatted messages are preserved with low-confidence flags rather than discarded.

### Option B: Direct WhatsApp Account Synchronization Status
- **Is direct live WhatsApp integration available?**
  **No.** Meta's official WhatsApp Business Platform (Cloud API) only supports registered commercial accounts, pre-approved message templates, and dedicated webhook servers—it does not provide an authorized consumer API to read personal, end-to-end encrypted group chats.
- Unauthorized methods (e.g. cookie extraction, session hijacking, or automated Puppeteer scraping) compromise user account security, violate WhatsApp terms of service, and risk account bans.
- MissedIt AI uses the **official, legitimate, and 100% private** `.txt` export workflow.

### Option C: Quick Launch WhatsApp Web
MissedIt AI includes a quick launch action for WhatsApp Web (`https://web.whatsapp.com/`) alongside step-by-step export instructions for iOS and Android.

---

## 3. Privacy-First Architecture

- **100% Client-Side:** All parsing, classification, and summarization run completely inside the browser's JavaScript engine.
- **Zero Cloud Uploads:** No chat files or messages are ever uploaded to any server or external cloud storage.
- **Zero Paid AI API Relays:** No external LLM endpoints receive your private chat messages.
- **Transient Memory:** Raw messages are stored in volatile React component state and are discarded upon page reload or clicking **"Clear Conversation"**.

---

## 4. Key Application Sections

1. **Home / Import Workspace**: File dropzone, preview inspector, speaker detection, username focus, paste fallback, and 1-click Demo loader.
2. **Catch-Up Dashboard**: Real dynamic metrics (messages, urgent count, tasks, decisions, mentions, speakers), executive briefing headline, and Top 3 Next Actions.
3. **Priority Inbox**: Filter messages by Urgent, Important, Normal, and Low Priority with transparent explanation cards.
4. **My Action Items**: Interactive task tracker with completion toggling, task editing, deletion, custom task creation, and clipboard export.
5. **Key Decisions**: Surface approvals, architecture choices, and consensus tagged as Final or Possible.
6. **Mentions & Replies**: Highlight direct @mentions, personalized questions, and group reply requests.
7. **Deadline Overview**: Categorized milestones (Due Today, Upcoming, Overdue, Undated).
8. **Settings & Privacy**: Verification of in-browser execution, JSON/TXT export downloads, and instant memory purge.

---

## 5. Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans + JetBrains Mono
- **Icons**: Lucide React
- **Testing**: Vitest 5
- **Deployment**: Static SPA (Deployable on Vercel, Netlify, or GitHub Pages)

---

## 6. Project Structure

```
missedit-ai/
├── index.html                  # HTML entry point with metadata and fonts
├── package.json                # Project configuration and scripts
├── tsconfig.json               # TypeScript compiler config
├── vite.config.ts              # Vite bundler setup
├── metadata.json               # Applet capabilities metadata
├── README.md                   # Complete documentation
└── src/
    ├── main.tsx                # React application entry
    ├── App.tsx                 # Core application state & layout orchestrator
    ├── index.css               # Tailwind CSS & typography layers
    ├── types/
    │   └── index.ts            # TypeScript data contracts
    ├── engine/
    │   ├── whatsappParser.ts   # Tolerant WhatsApp text export parser
    │   ├── priority.ts         # Deterministic priority scoring engine
    │   ├── actionItems.ts      # Action item extraction & assignment logic
    │   ├── decisions.ts        # Decision detection & confidence tagging
    │   ├── deadlines.ts        # Date & deadline categorization engine
    │   ├── mentions.ts         # Direct @mentions & query detector
    │   ├── summarizer.ts       # Extractive briefing & next actions engine
    │   ├── analyzer.ts         # Unified orchestrator pipeline
    │   └── demoData.ts         # Synthetic 20-message hackathon sample
    ├── components/
    │   ├── Header.tsx          # Top Bar adhering to Top Bar contract
    │   ├── Sidebar.tsx         # Responsive navigation sidebar & mobile drawer
    │   ├── ChatImport.tsx      # WhatsApp drag & drop, paste fallback, & guide
    │   ├── MetricCards.tsx     # Dynamic KPI statistics strip
    │   ├── SummaryPanel.tsx    # Executive briefing & next action cards
    │   ├── PriorityInbox.tsx   # Filterable priority inbox with reason badges
    │   ├── ActionItems.tsx     # Task board with status toggles & inline editor
    │   ├── DecisionsPanel.tsx  # Key decisions & consensus board
    │   ├── MentionsPanel.tsx   # Direct @mentions & reply requests
    │   ├── DeadlinePanel.tsx   # Timeline & deadline overview
    │   ├── MessageDetailsModal.tsx # Full message inspection & context modal
    │   ├── SettingsPrivacy.tsx # Local privacy settings & data export
    │   ├── EmptyState.tsx      # Helpful empty state placeholders
    │   └── Toast.tsx           # Transient feedback notifications
    └── test/
        ├── whatsappParser.test.ts # Parser format test suite
        └── analyzer.test.ts       # Scoring & task extraction test suite
```

---

## 7. Windows PowerShell Instructions

### 7.1 Run Locally

1. Install [Node.js](https://nodejs.org/) (version 18+ recommended).
2. Open Windows PowerShell in your project folder:
```powershell
cd missedit-ai
```
3. Install dependencies:
```powershell
npm install
```
4. Run the local development server:
```powershell
npm run dev
```
5. Open your browser and navigate to `http://localhost:3000`.
6. Run automated unit tests:
```powershell
npm test
```
7. Build for production:
```powershell
npm run build
```

---

### 7.2 Push to GitHub

1. Create a new empty repository named `missedit-ai` on [GitHub](https://github.com/new) (do not initialize with a README).
2. Open PowerShell in your local project root:
```powershell
git init
git add .
git commit -m "Build MissedIt AI hackathon MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/missedit-ai.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username).*

3. If Git is already initialized in your directory, check current remotes first:
```powershell
git status
git remote -v
```
To update the remote if necessary:
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/missedit-ai.git
git add .
git commit -m "Update MissedIt AI source code"
git push -u origin main
```

---

## 8. Optional Vercel Deployment

MissedIt AI is a static Vite application and can be deployed to Vercel in 60 seconds:
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** &rarr; **"Project"**.
3. Import your `missedit-ai` GitHub repository.
4. Keep the default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

---

## 9. Verification & Live Demonstration Guide

To demonstrate the full workflow during your hackathon pitch:
1. **Open MissedIt AI**: Notice the clean SaaS dashboard design, privacy badge, and dark mode toggle.
2. **Click "Load Hackathon Demo"**: Instantly loads a realistic 20-message sprint conversation and sets `"Alex"` as the active user.
3. **Inspect the Catch-Up Dashboard**:
   - Review the headline and dynamic metrics (messages, urgent alerts, tasks, decisions).
   - See the **Top 3 Recommended Next Actions** ranked with clear rationale.
4. **Inspect Priority Inbox**:
   - Switch between **Urgent**, **Important**, **Normal**, and **Low Priority**.
   - Note the transparent reason badges (e.g., *"Directly addresses you"*, *"High-urgency alert vocabulary"*).
   - Click any message to open the inspection modal showing surrounding context.
5. **Manage Action Items**:
   - Filter by **"Assigned to Me"** (shows tasks assigned to Alex).
   - Click the checkmark to mark a task as completed — observe the progress bar and pending counters update in real time without page reloads.
6. **Review Decisions & Deadlines**:
   - Inspect decisions labeled **Final Decision** vs **Possible Proposal**.
   - Review deadlines organized into **Due Today** vs **Upcoming**.
7. **Export & Purge**:
   - Click **"Export Report"** to download a formatted `.txt` executive briefing.
   - Click **"Clear Conversation"** to reset the application state.
   - Drag and drop your own exported WhatsApp chat file to verify real-world parsing!
