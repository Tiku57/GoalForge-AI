import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const health = {
    gemini: 'unknown',
    currentModel: 'gemini-2.5-flash',
    database: 'unknown',
    planner: 'unknown'
  };

  // Test Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'working';
  } catch (error) {
    console.error("Database health check failed:", error);
    health.database = 'failing';
  }

  // Test Gemini API
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'ping',
    });
    if (response.text) {
      health.gemini = 'working';
      health.planner = 'working';
    } else {
      health.gemini = 'failing';
      health.planner = 'failing';
    }
  } catch (error) {
    console.error("Gemini API health check failed:", error);
    health.gemini = 'failing';
    health.planner = 'failing'; // Will fallback locally during real execution
  }

  return NextResponse.json(health);
}
