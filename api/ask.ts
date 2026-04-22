import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, context } = req.body;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: `Eres un asistente que ayuda a personas hispanas a entender documentos.
Responde en espanol simple y tranquilo.
No des consejos legales ni medicos.
Basa tu respuesta solo en el contenido del documento proporcionado.`,
      messages: [
        { role: "user", content: `Documento: ${context}\n\nPregunta: ${question}` },
      ],
    });

    const result = message.content[0].type === "text" ? message.content[0].text.trim() : "";
    res.status(200).json({ answer: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
