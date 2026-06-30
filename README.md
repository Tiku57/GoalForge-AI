<div align="center">
  
# 🤖 GoalForge AI
**Your Autonomous Chief of Staff**

GoalForge AI is an autonomous, multi-agent AI planner that transforms high-level goals into actionable, interactive, and visually stunning execution workflows.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini API](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 🚀 Live Demo

**Experience GoalForge AI live in your browser:**

### [https://goal-forge-ai-silk.vercel.app](https://goal-forge-ai-silk.vercel.app) 

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://goal-forge-ai-silk.vercel.app)

---

## 📖 Project Overview

GoalForge AI bridges the gap between ambitious ideas and systematic execution. It solves the "blank canvas problem" by taking a single goal from the user and orchestrating a team of autonomous AI agents to break it down, analyze risks, sequence tasks, and execute them.

Built for **founders, engineers, product managers, and ambitious individuals**, GoalForge AI is different because it doesn't just give you a text list—it gives you an interactive graph, a timeline, risk profiling, and an execution engine that does the heavy lifting for you.

### Key Innovations:
- **Visual Node Graph:** Real-time generation of dependency graphs powered by React Flow.
- **Agentic Workflows:** Dedicated Research, Execute, and Optimize agents.
- **Predictive Risk Analytics:** On-the-fly calculation of success probabilities and buffer days.
- **Fluid Responsive Design:** A masterclass in responsive UI, perfectly scaling from 320px mobile screens to ultra-wide desktop monitors.

---

## ✨ Key Features

- 🧠 **AI-Powered Planning:** Converts abstract goals into detailed, chronological node graphs.
- 🤖 **Multi-Agent Workflow:** Different AI personas (Research, Execute, Optimize) tackle specialized tasks.
- 🗺️ **React Flow Visual Planner:** Interactive drag-and-drop DAG (Directed Acyclic Graph) interface.
- 📦 **Deliverables Tracking:** Captures outputs, markdown documents, and logs from each agent.
- ⏱️ **Timeline Generation:** Context-aware scheduling and deadline tracking.
- 🔗 **Dependency Analysis:** Identifies bottlenecks and critical paths dynamically.
- ⚠️ **Risk Analysis:** Estimates success probabilities based on complexity and deadlines.
- 🚀 **Autonomous Execution:** The "Autopilot" executes entire pipelines step-by-step without human intervention.
- 💡 **AI Recommendations:** Suggests the next best action and optimization strategies.
- 🔍 **Interactive Node Inspector:** A robust bottom-sheet/sidebar for examining node logs and deliverables.
- 📊 **Analytics Dashboard:** Keep track of project velocity and completion metrics.
- 💻 **Professional UI/UX:** A dark-mode first, glassmorphic SaaS interface.
- 📱 **Fully Responsive:** Fluid mechanics replacing rigid breakpoints, offering an uncompromising mobile experience.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma |
| **AI Layer** | Google Gemini API (2.5 Flash / Pro) |
| **Visualization**| React Flow, Dagre (Layout Engine) |
| **State Management**| React Hooks, Local Component State |
| **Deployment** | Vercel |

---

## 🏗 Architecture

GoalForge AI employs a modern serverless architecture utilizing the Next.js App Router for optimal rendering and API orchestration.

```mermaid
graph TD
    Client[Client UI - React Flow] --> |API Routes| NextJS[Next.js Server]
    NextJS --> |Prompts & Context| Gemini[Gemini AI Model]
    NextJS --> |Read/Write| Prisma[Prisma ORM]
    Prisma --> |Connection Pool| DB[(Neon PostgreSQL)]
    Gemini --> |Structured JSON| NextJS
    NextJS --> |Parsed Workflows| Client
```

- **Client:** React Flow handles the intensive DAG layout engine (via Dagre) while Framer Motion handles transition physics.
- **API Layer:** Next.js Route Handlers manage agent instructions and state persistence.
- **AI Engine:** Google Gemini parses complex instructions using strict JSON schema validation.
- **Database:** Prisma syncs workflow nodes, edge definitions, and execution logs to a Neon PostgreSQL instance.

---

## ⚙️ Installation

### 1. Clone the repository
```bash
git clone https://github.com/Tiku57/GoalForge-AI.git
cd GoalForge-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (see [Environment Variables](#-environment-variables)).

### 4. Setup Prisma Database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🔐 Environment Variables

Create a `.env` file at the root of your project:

```env
# Google Gemini API key for AI Agent orchestration
GEMINI_API_KEY="your_gemini_api_key"

# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@endpoint/dbname?sslmode=require"
```

---

## 📁 Folder Structure

```
GoalForge-AI/
├── prisma/                 # Database schema and migrations
│   └── schema.prisma       # Prisma models (Workflow, Node, Edge, Task)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes (Agents, Debug, Demo)
│   │   ├── dashboard/      # Main Application UI
│   │   ├── demo/           # Cinematic Demo View
│   │   └── globals.css     # Global Tailwind utilities
│   ├── components/         # React Components
│   │   ├── graph/          # React Flow Canvas, Custom Nodes
│   │   ├── layout/         # Sidebars, Headers, Modals
│   │   ├── landing/        # Landing Page & Demo elements
│   │   └── ui/             # Shared UI components (Buttons, Logos)
│   └── lib/                # Utility functions and Prisma client
└── package.json            # Dependencies and scripts
```

---

## 🔄 The Workflow Engine

How GoalForge AI works under the hood:

1. **Goal Input:** The user provides a high-level goal and optional deadline.
2. **Planning Phase:** The `Planning Agent` dissects the goal into a Directed Acyclic Graph (DAG) of logical steps.
3. **Graph Rendering:** React Flow and Dagre render the timeline, organizing nodes by dependency.
4. **Agent Execution:** The `Execute Agent` processes nodes synchronously or via autopilot.
5. **Deliverables:** Artifacts (markdown, code, logs) are generated and stored in the database.
6. **Risk Analysis:** Completion metrics, buffer days, and critical paths are dynamically calculated based on progress.

---

## 🎨 Design Philosophy

- **AI-First:** The UI is designed to accommodate AI output, not the other way around. Context windows are vast, and logs are deeply nested.
- **Autonomous Planning:** Emphasizing a "hands-off" approach where the AI orchestrates the meta-work.
- **Modern SaaS UI:** Embracing deep dark mode, high-contrast borders, fluid transitions, and glassmorphism.
- **Fluid Responsiveness:** The UI adapts perfectly using `clamp()`, `flex`, and `grid` systems rather than fixed pixel dimensions.

---

## ⚡ Performance

- **App Router:** Utilizes Next.js Server Components to reduce client-side bundle size.
- **Optimized Rendering:** React Flow's viewport only renders visible nodes, preventing DOM bloat on massive workflows.
- **Edge Deployment Ready:** Completely compatible with Vercel's edge network and Neon's serverless pooling.

---

## ☁️ Deployment

GoalForge AI is fully optimized for **Vercel** and **Neon**.

### Vercel Deployment
1. Import your GitHub repository to Vercel.
2. Add the `GEMINI_API_KEY` and `DATABASE_URL` environment variables.
3. Vercel will automatically detect Next.js and run `npm run build`.
4. Ensure your Prisma `postinstall` script runs `npx prisma generate`.

### Database Production Notes
- Use connection pooling for Neon in production to prevent connection exhaustion during concurrent AI agent writes.

---

## 🗺 Future Roadmap

- [ ] **Multi-LLM Support:** Seamless switching between Claude, GPT-4, and Gemini.
- [ ] **Real-time Collaboration:** Multiplayer cursor support for team workflows.
- [ ] **Export Formats:** Export workflows to PDF, Notion, or Jira.
- [ ] **Agent Marketplace:** Custom agent instructions and personas.
- [ ] **Persistent AI Memory:** Long-term memory storage using vector databases (Pinecone/Weaviate).

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Credits

**Built by Aaditya Sattawan**

- **GitHub:** [@Tiku57](https://github.com/Tiku57)
- **LinkedIn:** [Aaditya Sattawan](https://www.linkedin.com/in/aaditya-sattawan)

---

<div align="center">
  <i>If you found this project helpful, please consider giving it a ⭐ on GitHub!</i>
</div>
