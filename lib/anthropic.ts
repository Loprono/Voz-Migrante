import { Platform } from "react-native";
import Anthropic from "@anthropic-ai/sdk";

export type DocumentAnalysis = {
  resumen: string;
  puntos_importantes: { label: string; value: string }[];
  siguientes_pasos: string[];
  terminos_clave: { term: string; explicacion: string }[];
  disclaimer: null | "legal" | "medical";
};

const DOCUMENT_SYSTEM_PROMPT = `Eres un asistente que ayuda a personas hispanas en EE.UU. a entender documentos en ingles.
Tu trabajo es explicar documentos de forma clara y simple en espanol.

Reglas:
- Responde SIEMPRE en espanol simple y tranquilo
- Usa oraciones cortas, sin tecnicismos
- Cuando uses un termino en ingles, explicalo en parentesis
- NO des consejos legales ni medicos
- Si el documento involucra asuntos legales o de inmigracion, agrega disclaimer: "legal"
- Si es medico, agrega disclaimer: "medical"
- Si no aplica ninguno, pon disclaimer: null

Responde UNICAMENTE con este JSON (sin markdown, sin texto adicional):
{
  "resumen": "Resumen en 2-3 oraciones simples",
  "puntos_importantes": [{ "label": "...", "value": "..." }],
  "siguientes_pasos": ["Paso 1", "Paso 2"],
  "terminos_clave": [{ "term": "...", "explicacion": "..." }],
  "disclaimer": null
}`;

const TRANSLATION_SYSTEM_PROMPT = `Eres un interprete en tiempo real para una persona hispana en EE.UU.
Traduce de forma natural y conversacional.
Adapta la formalidad al contexto.
NUNCA agregues explicaciones — solo traduce.
Responde UNICAMENTE con la traduccion.`;

const isWeb = Platform.OS === "web";

// On native, call Claude directly. On web, call our serverless API (hides the key).
const nativeClient = !isWeb
  ? new Anthropic({ apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "" })
  : null;

export async function analyzeDocument(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<DocumentAnalysis> {
  if (isWeb) {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image, mimeType }),
    });
    if (!res.ok) throw new Error("Analysis failed");
    return res.json();
  }

  const message = await nativeClient!.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: DOCUMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mimeType, data: base64Image } },
          { type: "text", text: "Analiza este documento y responde en JSON." },
        ],
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(text) as DocumentAnalysis;
}

export async function translateText(
  text: string,
  direction: "es-en" | "en-es"
): Promise<string> {
  if (isWeb) {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, direction }),
    });
    if (!res.ok) throw new Error("Translation failed");
    const data = await res.json();
    return data.translation;
  }

  const userMessage =
    direction === "es-en"
      ? `Traduce al ingles: "${text}"`
      : `Traduce al espanol: "${text}"`;

  const message = await nativeClient!.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: TRANSLATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : "";
}

export async function askAboutDocument(
  question: string,
  documentContext: string
): Promise<string> {
  if (isWeb) {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, context: documentContext }),
    });
    if (!res.ok) throw new Error("Ask failed");
    const data = await res.json();
    return data.answer;
  }

  const message = await nativeClient!.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: `Eres un asistente que ayuda a personas hispanas a entender documentos.
Responde en espanol simple. No des consejos legales ni medicos.`,
    messages: [{ role: "user", content: `Documento: ${documentContext}\n\nPregunta: ${question}` }],
  });

  return message.content[0].type === "text" ? message.content[0].text.trim() : "";
}
