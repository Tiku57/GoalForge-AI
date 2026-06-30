<div align="center">
  
# ⚡️ GoalForge AI

**The Autonomous Chief of Staff & Multi-Agent Execution Engine**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Gemini 2.5](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge&logo=react&logoColor=white)](https://reactflow.dev/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

**Finalist Submission for Vibe2Ship Hackathon 2026**

</div>

---

## 🚀 Overview

GoalForge AI is a premium, production-grade autonomous agent pipeline that transforms ambitious, high-level objectives into actionable, mathematically prioritized Dependency Graphs (DAGs), and then autonomously executes them using an ensemble of specialized AI models.

It functions as your **Autonomous Chief of Staff**, bridging the gap between "having an idea" and "having the deliverables ready".

## ✨ Core Features

* **🧠 AI Goal Planning:** Input any objective, and GoalForge will generate a complete, dependency-aware master plan using Gemini 2.5 Flash.
* **🕸️ Interactive React Flow DAG:** A beautifully crafted, interactive pipeline visualization to track milestones, tasks, and actions.
* **📈 Dynamic Execution Analytics:** Real-time probability calculations, Risk Score assignment, and Buffer Days simulation.
* **🤖 Auto Execute Workflow:** Engaging an autopilot sequence that orchestrates multiple autonomous agents (Planner, Researcher, Writer, Reviewer) over the graph.
* **📡 Live Streaming Execution:** Watch the AI's internal monologue and sub-task streaming directly on the dashboard.
* **🛡️ Intelligent Offline Planner:** A resilient heuristic fallback engine that gracefully handles API limits to ensure 100% uptime.
* **⚡ Production-Grade UI/UX:** Built with glassmorphism, cinematic Framer Motion animations, minimal aesthetics, and a top-right live telemetry widget.
* **📄 Markdown & PDF Export:** Seamlessly convert agent deliverables into high-quality, sanitized PDFs.

---

## 🛠️ Architecture

GoalForge AI is built on a modern, bleeding-edge tech stack designed for speed, resilience, and real-time feedback.

### **Frontend**
* **Next.js 16.2.9 (Turbopack):** Lightning-fast rendering and API routes.
* **React 19:** Utilizing the latest concurrent features.
* **Tailwind CSS v4:** Heavy use of modern CSS variables, glassmorphism, and minimal gradients.
* **React Flow:** Advanced DAG rendering with `dagre` for automated node positioning.
* **Framer Motion:** Cinematic UI transitions and modal animations.

### **Backend & AI Pipeline**
* **Streaming Edge APIs:** Real-time token streaming using `TextEncoderStream`.
* **Gemini 2.5 Flash (`@google/genai`):** The primary brain behind planning and execution.
* **Offline Heuristic Engine:** A bespoke fallback DAG generator that calculates realistic dependencies when offline.
* **Prisma (SQLite):** Lightweight persistence layer for caching workflows and deliverables.

---

## 🎬 Watch Live Demo

The application includes an immersive, cinematic walkthrough that simulates the entire product experience:

1. **Open Landing Page:** Navigate to `/`.
2. **Watch Live Demo:** Click the primary CTA to trigger the 7-step interactive presentation.
3. **Experience the Flow:** Watch as the application automatically inputs a goal, generates a graph, triggers the Auto-Execute pipeline, produces a Deliverable via the Node Inspector, and calculates a final Risk Summary.

---

## 💻 Installation Guide

Run GoalForge AI locally in minutes.

### Prerequisites
* Node.js (v20+)
* A Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/Tiku57/GoalForge-AI.git
cd GoalForge-AI
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and add your keys. Only `GEMINI_API_KEY` is strictly required for the core workflow to function.
```env
# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Database (SQLite defaults to file:./dev.db)
DATABASE_URL="file:./dev.db"
```

### 4. Initialize Database
```bash
npx prisma db push
npx prisma generate
```

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📂 Project Structure

```
├── prisma/                 # Database schema and SQLite DB
├── public/                 # Static assets and icons
├── src/
│   ├── app/                # Next.js App Router (Landing, Dashboard, APIs)
│   ├── components/
│   │   ├── graph/          # React Flow Canvas and Nodes
│   │   ├── landing/        # Hero, Navbar, Demo Modal
│   │   ├── layout/         # Node Inspector, Debug Panel
│   │   └── ui/             # Reusable UI primitives
│   └── lib/                # Utilities, Types, and Formatting
├── .env.example            # Environment variables template
├── package.json            # Dependencies
└── README.md               # Documentation
```

---

## 🎨 UI/UX Philosophy

GoalForge AI strictly adheres to premium design aesthetics:
- **No overlapping elements:** Tooling (like the AI Status Indicator) participates naturally in the layout.
- **Cinematic Transitions:** Layout shifts are masked via `AnimatePresence`.
- **Developer Experience:** Detailed offline fallback logs are restricted to development modes, keeping production environments clean.

---

<div align="center">
  <p>Built with precision for <strong>Vibe2Ship 2026</strong>.</p>
</div>
