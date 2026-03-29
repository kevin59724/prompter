import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  // Configuración recomendada para Edge Functions en Vercel (son mucho más rápidas)
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt, category, action } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Falta el prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // La llave ahora se toma de las variables secretas de Vercel (o del .env local), no del frontend
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key secreta no configurada en el servidor' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let finalInstruction = "";

    // Si es una acción directa de ajuste ("Más corto", "Traducir", "Variante")
    if (action) {
      if (action === 'shorten') {
        finalInstruction = `Resume y acorta el siguiente prompt, haciéndolo directo y conciso sin perder sus parámetros técnicos principales:\n\n"${prompt}"`;
      } else if (action === 'translate') {
        finalInstruction = `Traduce el siguiente prompt al inglés nativo, pero manteniéndolo como un mandato directo (Ej. si dice 'crea una imagen de...', tradúcelo a 'create an image of...'). Conserva los parámetros técnicos:\n\n"${prompt}"`;
      } else if (action === 'vary') {
        finalInstruction = `Agrega instrucciones extremadamente creativas, abstractas, fuera de la caja o vanguardistas a este prompt base conservando su núcleo y no borres lo que ya está. Devuelve solo el resultado extendido:\n\n"${prompt}"`;
      }
    } 
    // Si es la generación base del prompt
    else {
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

    return new Response(JSON.stringify({ result: textOutput }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    return new Response(JSON.stringify({ error: 'Hubo un fallo generando el contenido con Gemini' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
