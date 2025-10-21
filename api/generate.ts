import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const {
    GEMINI_AI_KEY
} = process.env;


const ai = new GoogleGenAI({
    apiKey: GEMINI_AI_KEY,

});

// Puto vercel de mierda.

async function generateDilemmas(): Promise<string[]> {

    const prompt = `Genera diez dilemas morales o éticos en español, dirigidos a un público joven (de 15 a 25 años).
Requisitos:
- Cada dilema debe formularse como una sola pregunta de "sí o no"
- Deben ser dilemas difíciles de responder, donde ambas opciones parezcan moralmente incorrectas o conflictivas
- No hagas preguntas que sean muy generales, haz preguntas que sean MUY PERSONALES, que jueguen bastante con el lector
- Juega bastante con la percepción de bondad y maldad de los lectores
- No incluyas explicaciones, contexto ni numeración
- Se demasiado claro y directo, que pueda entenderse fácilmente
- Devuelve ÚNICAMENTE un array JSON con 10 strings o con un array de respuesta múltiple. No escribas texto fuera del array ni comentarios

- IMPORTANTE: También sé muy personal con el tema familiar, de forma en la que hagas preguntas sobre "perdonar traumas".
- IMPORTANTE: Haz preguntas que afecten mucho al lector o a sus conocidos, no incluyas a terceros por los que el lector pueda sentir indiferencia


Ejemplo de formato de salida esperado

[
  "¿Salvarías la vida de alguien que te cae mal?",
  "¿Perdonarías a tu hermano si te quitara a tu novia?",
  "¿Estarías con alguien que no amas, solo para complacer a tu familia?"
]`;

    const geminiResponse = await ai.models.generateContent({
        config: {
            temperature: 0.9,
            topP: 0.8,
            topK: 60
        },
        model: 'gemini-2.0-flash-lite',
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt }
                ]
            }
        ]
    });


    const regex = /\[[\s\S]*\]/;
    const match = geminiResponse.text?.match(regex);

    if (match) {
        try {
            const questions = JSON.parse(match[0] ?? '[]');

            if (!(questions instanceof Array) || questions.length <= 0) {
                console.log("INVALID QUESTIONS: ", questions);

                return await generateDilemmas();
            }

            return questions;
        } catch (error) {
            console.log("Error 1. It seems Gemini didn't give a parseable response:\n", geminiResponse.text);
        }
    } else {
        console.log("Error 2. It seems Gemini didn't give a parseable response:\n", geminiResponse.text);
    }

    return await generateDilemmas();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {


    if (GEMINI_AI_KEY === undefined) {
        res.status(404);
        return;
    }


    try {
        const dilemmas = await generateDilemmas();

        res
            .setHeader('content-type', 'application/json')
            .status(200)
            .end(JSON.stringify(dilemmas));

        return;

    } catch (error) {
        res
            .status(500)
            .end(`${error}`);

    }
};
