import Anthropic from "@anthropic-ai/sdk";

const TRANSLATION_SYSTEM_PROMPT = `Eres un interprete en tiempo real para una persona hispana en EE.UU.
Traduce de forma natural y conversacional, manteniendo el significado original.
Adapta la formalidad al contexto: medico, banco, escuela o casual.
NUNCA agregues explicaciones — solo traduce.
Espanol -> Ingles: ingles americano claro, educado y profesional.
Ingles -> Espanol: espanol latinoamericano simple y natural.
Responde UNICAMENTE con la traduccion, sin comillas ni texto adicional.`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, direction } = req.body;
    if (!text || !direction) {
      return res.status(400).json({ error: "Missing text or direction" });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userMessage =
      direction === "es-en"
        ? `Traduce al ingles: "${text}"`
        : `Traduce al espanol: "${text}"`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: TRANSLATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const result = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    res.status(200).json({ translation: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
