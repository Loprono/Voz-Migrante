import Anthropic from "@anthropic-ai/sdk";

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
  "puntos_importantes": [
    { "label": "Nombre del punto", "value": "Valor o dato importante" }
  ],
  "siguientes_pasos": [
    "Paso practico 1",
    "Paso practico 2"
  ],
  "terminos_clave": [
    { "term": "termino en ingles", "explicacion": "que significa en espanol simple" }
  ],
  "disclaimer": null
}`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, mimeType } = req.body;
    if (!image) return res.status(400).json({ error: "Missing image" });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: DOCUMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mimeType ?? "image/jpeg", data: image },
            },
            { type: "text", text: "Analiza este documento y responde en el formato JSON indicado." },
          ],
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const result = JSON.parse(text);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
