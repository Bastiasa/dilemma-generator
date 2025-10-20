import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const {
    GEMINI_AI_KEY
} = process.env;


const ai = new GoogleGenAI({
    apiKey: GEMINI_AI_KEY,

});

async function generateDilemmas(): Promise<string[]> {

    const prompt = `Genera diez dilemas morales o éticos en español. 
Deben ser preguntas de sí o no, sin explicación adicional.
No uses temas repetidos ni clichés.
Sé bastante creativo, intenta crear una pregunta que no sea muy común y que deje a los lectores introspeccionando.
Debe ser un array que contenga unicamente strings. SOLO EL TEXTO DEL ARRAY, SIN NADA QUE PUEDA DIFICULTAR LA LECTURA POR PARTE DE JSON.
No pueden ser dilemas muy complejos o con un vocabulario muy rebuscado, pues es dirigido a jóvenes entre 8 a 14 años.`;

    const geminiResponse = await ai.models.generateContent({
        config: {
            temperature: 1,
            topP: 0.5,
            topK: 125
        },
        model: 'gemini-2.0-flash-001',
        contents: prompt
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
