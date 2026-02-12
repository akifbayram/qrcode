const SYSTEM_PROMPT = `You are analyzing photos of physical storage bin contents for an inventory system.
You may receive one or multiple photos of the same bin from different angles.
Examine all images and provide:
1. A short, descriptive name for this bin (2-5 words)
2. A list of distinct items visible across all images
3. Category tags that describe the type of contents (e.g., "tools", "electronics")
4. Brief notes about the contents or organization

Respond ONLY with valid JSON in this exact format, no markdown fences:
{"name":"...","items":["..."],"tags":["..."],"notes":"..."}`;

export type AiProviderType = 'openai' | 'anthropic' | 'openai-compatible';

export interface AiProviderConfig {
  provider: AiProviderType;
  apiKey: string;
  model: string;
  endpointUrl: string | null;
}

export interface AiSuggestionsResult {
  name: string;
  items: string[];
  tags: string[];
  notes: string;
}

export interface ImageInput {
  base64: string;
  mimeType: string;
}

type AiErrorCode = 'INVALID_KEY' | 'RATE_LIMITED' | 'MODEL_NOT_FOUND' | 'INVALID_RESPONSE' | 'NETWORK_ERROR' | 'PROVIDER_ERROR';

export class AiAnalysisError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.name = 'AiAnalysisError';
    this.code = code;
  }
}

function mapHttpStatus(status: number): AiErrorCode {
  if (status === 401 || status === 403) return 'INVALID_KEY';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 404) return 'MODEL_NOT_FOUND';
  return 'PROVIDER_ERROR';
}

function stripCodeFences(text: string): string {
  let s = text.trim();
  if (s.startsWith('```json')) s = s.slice(7);
  else if (s.startsWith('```')) s = s.slice(3);
  if (s.endsWith('```')) s = s.slice(0, -3);
  return s.trim();
}

function validateSuggestions(raw: unknown): AiSuggestionsResult {
  const obj = raw as Record<string, unknown>;

  let name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (name.length > 255) name = name.slice(0, 255);

  let items: string[] = [];
  if (Array.isArray(obj.items)) {
    items = obj.items
      .filter((i): i is string => typeof i === 'string')
      .map((i) => i.trim())
      .filter(Boolean)
      .slice(0, 100);
  }

  let tags: string[] = [];
  if (Array.isArray(obj.tags)) {
    tags = obj.tags
      .filter((t): t is string => typeof t === 'string')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20);
  }

  let notes = typeof obj.notes === 'string' ? obj.notes.trim() : '';
  if (notes.length > 2000) notes = notes.slice(0, 2000);

  return { name, items, tags, notes };
}

async function callOpenAiCompatible(
  config: AiProviderConfig,
  images: ImageInput[]
): Promise<AiSuggestionsResult> {
  const baseUrl = config.endpointUrl || 'https://api.openai.com/v1';
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const imageBlocks = images.map((img) => ({
    type: 'image_url' as const,
    image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
  }));

  const userText = images.length > 1
    ? `Analyze the contents of this storage bin (${images.length} photos).`
    : 'Analyze the contents of this storage bin.';

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: images.length > 1 ? 1500 : 1000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              ...imageBlocks,
              { type: 'text', text: userText },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    throw new AiAnalysisError('NETWORK_ERROR', `Failed to connect: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AiAnalysisError(mapHttpStatus(res.status), `Provider returned ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new AiAnalysisError('INVALID_RESPONSE', 'No content in provider response');
  }

  try {
    const parsed = JSON.parse(stripCodeFences(content));
    return validateSuggestions(parsed);
  } catch {
    throw new AiAnalysisError('INVALID_RESPONSE', `Failed to parse response as JSON: ${content.slice(0, 200)}`);
  }
}

async function callAnthropic(
  config: AiProviderConfig,
  images: ImageInput[]
): Promise<AiSuggestionsResult> {
  const baseUrl = config.endpointUrl || 'https://api.anthropic.com';
  const url = `${baseUrl.replace(/\/+$/, '')}/v1/messages`;

  const imageBlocks = images.map((img) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: img.mimeType,
      data: img.base64,
    },
  }));

  const userText = images.length > 1
    ? `Analyze the contents of this storage bin (${images.length} photos).`
    : 'Analyze the contents of this storage bin.';

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: images.length > 1 ? 1500 : 1000,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              ...imageBlocks,
              { type: 'text', text: userText },
            ],
          },
        ],
      }),
    });
  } catch (err) {
    throw new AiAnalysisError('NETWORK_ERROR', `Failed to connect: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AiAnalysisError(mapHttpStatus(res.status), `Provider returned ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json() as { content?: Array<{ type: string; text?: string }> };
  const textBlock = data.content?.find((b) => b.type === 'text');
  const content = textBlock?.text;
  if (!content) {
    throw new AiAnalysisError('INVALID_RESPONSE', 'No text content in Anthropic response');
  }

  try {
    const parsed = JSON.parse(stripCodeFences(content));
    return validateSuggestions(parsed);
  } catch {
    throw new AiAnalysisError('INVALID_RESPONSE', `Failed to parse response as JSON: ${content.slice(0, 200)}`);
  }
}

export async function analyzeImages(
  config: AiProviderConfig,
  images: ImageInput[]
): Promise<AiSuggestionsResult> {
  if (config.provider === 'anthropic') {
    return callAnthropic(config, images);
  }
  return callOpenAiCompatible(config, images);
}

export async function analyzeImage(
  config: AiProviderConfig,
  imageBase64: string,
  mimeType: string
): Promise<AiSuggestionsResult> {
  return analyzeImages(config, [{ base64: imageBase64, mimeType }]);
}

export async function testConnection(config: AiProviderConfig): Promise<void> {
  if (config.provider === 'anthropic') {
    const baseUrl = config.endpointUrl || 'https://api.anthropic.com';
    const url = `${baseUrl.replace(/\/+$/, '')}/v1/messages`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Reply with OK' }],
        }),
      });
    } catch (err) {
      throw new AiAnalysisError('NETWORK_ERROR', `Failed to connect: ${(err as Error).message}`);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new AiAnalysisError(mapHttpStatus(res.status), `Provider returned ${res.status}: ${body.slice(0, 200)}`);
    }
  } else {
    const baseUrl = config.endpointUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Reply with OK' }],
        }),
      });
    } catch (err) {
      throw new AiAnalysisError('NETWORK_ERROR', `Failed to connect: ${(err as Error).message}`);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new AiAnalysisError(mapHttpStatus(res.status), `Provider returned ${res.status}: ${body.slice(0, 200)}`);
    }
  }
}
