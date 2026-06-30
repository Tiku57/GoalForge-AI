# Local Setup Guide

1. **Clone & Install**
   ```bash
   git clone https://github.com/Tiku57/goalforge-ai.git
   cd goalforge-ai
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env.local` and `.env` (for Prisma CLI).
   ```bash
   cp .env.example .env.local
   cp .env.example .env
   ```
   Fill in your `GEMINI_API_KEY` and `DATABASE_URL`.

3. **Database Initialization**
   By default, the schema is configured for PostgreSQL (Neon).
   To push the schema:
   ```bash
   npx prisma db push
   ```
   *(Note: If you run this inside a restricted network that blocks port 5432, you may need to use Prisma Accelerate or momentarily switch the schema to SQLite for local development).*

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`.
