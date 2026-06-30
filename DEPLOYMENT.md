# Deployment Guide (Vercel)

1. **Push to GitHub**
   Ensure your code is pushed to your GitHub repository (`Tiku57/goalforge-ai`).

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com/) and click "Add New Project".
   - Import your `goalforge-ai` repository.

3. **Configure Environment Variables**
   In the Vercel project settings during import, add the following variables:
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.

4. **Build Command**
   Vercel will automatically detect Next.js.
   To ensure Prisma generates the client correctly during build, modify your `package.json` build script to:
   ```json
   "scripts": {
     "build": "prisma generate && next build"
   }
   ```
   *(This is already handled if Vercel detects Prisma, but it's good practice).*

5. **Deploy**
   Click Deploy. Vercel will build the Next.js app and run the serverless API routes.
