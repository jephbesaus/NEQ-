import { NextResponse } from "next/server";
import { getAIReply } from "@/lib/ai/textOrchestrator";

// Cette route reçoit les messages de l'utilisateur et les fait passer par
// la cascade de fournisseurs IA (OpenAI, puis Gemini, etc.). L'utilisateur
// ne voit jamais lequel a répondu — l'interface affiche seulement
// "NEQ réfléchit...". Le message de précaution est ajouté automatiquement
// à la fin de chaque réponse par l'orchestrateur.

export async function POST(request: Request) {
  const body = await request.json();
  const messages = body.messages as { role: "user" | "assistant"; content: string }[];
  const systemPrompt: string | undefined = body.systemPrompt;

  const { reply, anyConfigured } = await getAIReply(messages, systemPrompt);

  return NextResponse.json({ reply, configured: anyConfigured });
}
