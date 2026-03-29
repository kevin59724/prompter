import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // CORS configuration (opcional, pero útil si se llama desde otros dominios)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { prompt, category, action } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el prompt' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key secreta no configurada en el servidor (Vercel Settings)' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let finalInstruction = "";

    if (action) {
      if (action === 'shorten') {
        finalInstruction = `Resume y acorta el siguiente prompt, haciéndolo directo y conciso sin perder sus parámetros técnicos principales:\n\n"${prompt}"`;
      } else if (action === 'translate') {
        finalInstruction = `Traduce el siguiente prompt al inglés nativo, pero manteniéndolo como un mandato directo (Ej. si dice 'crea una imagen de...', tradúcelo a 'create an image of...'). Conserva los parámetros técnicos:\n\n"${prompt}"`;
      } else if (action === 'vary') {
        finalInstruction = `Agrega instrucciones extremadamente creativas, abstractas, vanguardistas a este prompt conservando su núcleo y no borres lo que ya está. Devuelve solo el resultado extendido:\n\n"${prompt}"`;
      }
    } else {
      let systemInstruction = "";
      if (category === 'image') {
        systemInstruction = "Eres un experto creador de prompts especializado en herramientas de generación de imágenes (Stable Diffusion, Midjourney, etc). Toma la idea del usuario y devuelve un **prompt técnico extremadamente detallado y fotorealista**, en formato Markdown o bloques legibles. Añade iluminación, encuadre de cámara, lente, paleta de color y resolución. Evita saludar, devuelve el prompt inmediatamente.";
      } else if (category === 'code') {
        systemInstruction = "Eres un Ingeniero Principal de Software. Transforma la simple solicitud del usuario en una directriz y arquitectura completa. Reestructura su requerimiento para que una IA sepa que debe aplicar buenas prácticas, código limpio, manejo de errores robusto y documentación explícita. Actúa como si dejaras un ticket formal. Sin saludos, ve de frente al resultado.";
      } else if (category === 'write') {
        systemInstruction = "Eres un Copywriter de Alto Rendimiento. Reestructura la simple orden del usuario en una petición experta para redactar artículos geniales. Dictamina en el prompt que la escritura debe ser magnética, tener párrafos cortos, tono persuasivo e invitar al 'engagement'. No saludes. Devuelve simplemente la orden transformada.";
      }
      finalInstruction = `${systemInstruction}\n\nRequerimiento del usuario: "${prompt}"\n\nGenera el Prompt Maestro a partir de la frase del usuario:\n`;
    }

    const result = await model.generateContent(finalInstruction);
    const textOutput = result.response.text();

    return res.status(200).json({ result: textOutput });

  } catch (error) {
    console.error('Error en el backend Vercel:', error);
    // Mostrará exactamente por qué falló Gemini (ej. clave denegada, error de conexión, etc)
    return res.status(500).json({ error: `Fallo con Gemini: ${error.message || error}` });
  }
}
