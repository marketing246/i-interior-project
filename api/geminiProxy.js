// Vercel Serverless Function (ESM Syntax)
import { GoogleGenAI, Modality, Type } from '@google/genai';
import cors from 'cors';

// Инициализируем CORS middleware
const corsMiddleware = cors({ origin: true });

// Инициализируем Gemini API. Ключ API должен быть установлен как переменная окружения
// в вашем Vercel проекте.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error('API_KEY environment variable not set on the server.');
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Безопасно парсит JSON-строку, которая может быть обернута в markdown-блок.
 * @param {string} jsonStr Входная строка.
 * @returns {any} Разобранный JSON-объект или пустой массив в случае ошибки.
 */
const robustJsonParse = (jsonStr) => {
    let cleanJsonStr = jsonStr.trim();
    if (cleanJsonStr.startsWith('```json')) {
        cleanJsonStr = cleanJsonStr.substring(7, cleanJsonStr.length - 3).trim();
    } else if (cleanJsonStr.startsWith('```')) {
        cleanJsonStr = cleanJsonStr.substring(3, cleanJsonStr.length - 3).trim();
    }

    try {
        const parsed = JSON.parse(cleanJsonStr);
        // Добавим проверку, что это действительно массив строк
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        }
        // Если структура не та, что ожидаем, возвращаем пустой массив
        return [];
    } catch (error) {
        console.error("Не удалось разобрать JSON строку:", cleanJsonStr, error);
        return [];
    }
};


/**
 * Распознает объекты на изображении.
 * @param {object} payload - Данные, содержащие base64Image и mimeType.
 * @returns {Promise<string[]>} Массив распознанных объектов.
 */
const handleIdentifyObjects = async (payload) => {
    const { base64Image, mimeType } = payload;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: `Проанализируй предоставленное изображение комнаты и определи основные, отдельные и редактируемые предметы дизайна интерьера. Перечисли их в виде JSON-массива строк. Примеры: 'диван', 'оконные шторы', 'кофейный столик', 'ковер'. Включай только те предметы, которые хорошо видны и могут быть реалистично отредактированы. Не включай структурные элементы, такие как стены, пол или потолок. Верни ТОЛЬКО JSON-массив, без какого-либо другого текста или форматирования markdown. Массив должен содержать от 3 до 8 элементов.` },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING, description: 'Редактируемый объект в комнате.' } },
        },
    });
    return robustJsonParse(response.text);
};

/**
 * Распознает основные элементы (стены, пол) на изображении.
 * @param {object} payload - Данные, содержащие base64Image и mimeType.
 * @returns {Promise<string[]>} Массив распознанных элементов.
 */
const handleIdentifyElements = async (payload) => {
    const { base64Image, mimeType } = payload;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: base64Image, mimeType: mimeType } },
                { text: `Проанализируй предоставленное изображение комнаты и определи основные структурные поверхности. Конкретно перечисли пол, потолок и любые отчетливые стены (например, 'левая стена', 'задняя стена', 'стена с окном'). Перечисли их в виде JSON-массива строк. Включай только 'пол', 'потолок' и описания стен. Верни ТОЛЬКО JSON-массив, без какого-либо другого текста или форматирования markdown. Массив должен содержать от 2 до 5 элементов.` },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING, description: 'Основной структурный элемент в комнате (стена, пол, потолок).' } },
        },
    });
    return robustJsonParse(response.text);
};


const extractBase64FromResponse = (response) => {
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

/**
 * Генерирует дизайны интерьеров.
 * @param {object} payload - Полный набор параметров для генерации.
 * @returns {Promise<string[]>} Массив сгенерированных изображений в формате base64.
 */
const handleGenerateDesigns = async (payload) => {
    const {
        base64Image, mimeType, userPrompt, isEditing, selectedObject,
        activeTool, toolValue, referenceImageBase64, referenceImageMimeType
    } = payload;

    let fullPrompt = '';
    const parts = [{ inlineData: { data: base64Image, mimeType: mimeType } }];

    if (selectedObject) {
        let transformationInstruction = activeTool && toolValue ? `Apply this transformation to it: "${toolValue}".\n` : '';
        let styleInstruction = userPrompt ? `Then, apply this style change to it: "${userPrompt}".\n` : '';

        if (referenceImageBase64 && referenceImageMimeType) {
            parts.push({ inlineData: { data: referenceImageBase64, mimeType: referenceImageMimeType } });
            fullPrompt = `You are an expert photo editor. The first image is the user's room. The second image is a style reference. The user wants to modify a specific object in the first image: the "${selectedObject}". Use the second image as a style and material reference. Change the "${selectedObject}" to match the style of the object in the second image. ${transformationInstruction} ${styleInstruction} Apply the changes ONLY to the "${selectedObject}". Preserve the rest of the first image, including the overall style, layout, lighting, and other objects, as closely as possible. The final image should be a photorealistic rendering.`
        } else {
            fullPrompt = `You are an expert photo editor. The user wants to modify a specific object: the "${selectedObject}". Apply the user's requested changes ONLY to the "${selectedObject}". ${transformationInstruction} ${styleInstruction} Preserve the rest of the image, including the overall style, layout, lighting, and other objects, as closely as possible. The final image should be a photorealistic rendering.`;
        }
    } else if (isEditing) {
        fullPrompt = `You are an expert photo editor and interior designer. A user has provided an image of a room and a request to modify it. Preserve the overall image, style, and layout. Apply the SPECIFIC change requested by the user. The final image should be a photorealistic rendering. User's request: "${userPrompt}"`;
    } else {
        fullPrompt = `You are an expert interior designer. A user has provided an image of their room and a request. Your task is to preserve the overall style of the interior shown in the image. Keep the exact same architectural layout, windows, doors, and perspective of the room. Subtly enhance and improve the interior furnishings, color palette, lighting, and decor based on the user's request, while maintaining the original's core aesthetic. The final image should be a photorealistic rendering of the redesigned space. User's request: "${userPrompt}"`;
    }

    const generateSingleDesign = async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [...parts, { text: fullPrompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        return extractBase64FromResponse(response);
    };

    const numberOfDesigns = isEditing || selectedObject ? 1 : 4;
    const designPromises = Array(numberOfDesigns).fill(null).map(() => generateSingleDesign());
    
    // Выполняем запросы параллельно для скорости
    const designs = await Promise.all(designPromises);
    const validResults = designs.filter(Boolean);

    if (validResults.length === 0) {
        throw new Error("ИИ не смог создать ни одного допустимого дизайна.");
    }
    return validResults;
};


/**
 * Основная HTTP-функция, обрабатывающая все запросы от фронтенда.
 */
export default function handler(req, res) {
    corsMiddleware(req, res, async () => {
        if (!API_KEY) {
            return res.status(500).json({ error: 'API_KEY environment variable not set on the server.' });
        }
        
        if (req.method !== 'POST') {
            return res.status(405).send({ error: 'Method Not Allowed' });
        }

        try {
            const { action, payload } = req.body;
            if (!action || !payload) {
                 return res.status(400).json({ error: 'Missing action or payload' });
            }

            let result;
            switch (action) {
                case 'identifyObjects':
                    result = await handleIdentifyObjects(payload);
                    res.status(200).json({ objects: result });
                    break;
                case 'identifyElements':
                    result = await handleIdentifyElements(payload);
                    res.status(200).json({ elements: result });
                    break;
                case 'generateDesigns':
                    result = await handleGenerateDesigns(payload);
                    res.status(200).json({ designs: result });
                    break;
                default:
                    res.status(400).json({ error: 'Invalid action' });
            }
        } catch (error) {
            console.error('Ошибка при обработке запроса:', error);
            res.status(500).json({ error: 'Внутренняя ошибка сервера. ' + error.message });
        }
    });
};