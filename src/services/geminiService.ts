// При развертывании на Vercel или аналогичной платформе, 
// фронтенд и API находятся на одном домене.
// Мы можем использовать относительный путь для вызова нашей функции.
const CLOUD_FUNCTION_URL = '/api/geminiProxy';

/**
 * Унифицированный обработчик для вызова API-эндпоинта.
 * @param action - Действие, которое должна выполнить функция (например, 'generateDesigns').
 * @param payload - Данные, необходимые для выполнения действия.
 * @returns - Разобранный JSON-ответ от функции.
 */
async function callApi(action: string, payload: any) {
    try {
        const response = await fetch(CLOUD_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Произошла неизвестная ошибка на сервере' }));
            console.error(`Ошибка от API для действия ${action}:`, errorData);
            throw new Error(errorData.error || `Запрос не удался со статусом ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Не удалось вызвать API для действия ${action}:`, error);
        // Повторно выбрасываем ошибку, чтобы ее мог поймать вызывающий компонент
        throw error;
    }
}


export const identifyObjectsInImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
    const data = await callApi('identifyObjects', { base64Image, mimeType });
    return data.objects || [];
};

export const identifyMajorElements = async (base64Image: string, mimeType: string): Promise<string[]> => {
    const data = await callApi('identifyElements', { base64Image, mimeType });
    return data.elements || [];
};

export const generateInteriorDesigns = async (
  base64Image: string,
  mimeType: string,
  userPrompt: string,
  isEditing: boolean,
  selectedObject: string | null,
  activeTool: string | null,
  toolValue: string | null,
  referenceImageBase64: string | null,
  referenceImageMimeType: string | null
): Promise<string[]> => {
    const payload = {
        base64Image,
        mimeType,
        userPrompt,
        isEditing,
        selectedObject,
        activeTool,
        toolValue,
        referenceImageBase64,
        referenceImageMimeType,
    };
    const data = await callApi('generateDesigns', payload);
    if (!data.designs) {
        throw new Error("Не удалось получить дизайны от сервера.");
    }
    return data.designs;
};
