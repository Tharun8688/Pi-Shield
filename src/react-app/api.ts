import { API_BASE_URL } from './config';

export async function analyzeVideo(videoUrl: string) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error: ${response.status} - ${text}`);
  }

  return response.json();
}

export async function analyzeText(content: string, contentType?: string) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, contentType }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error: ${response.status} - ${text}`);
  }

  return response.json();
}

export async function analyzeMultimodal(formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/api/analyze-multimodal`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error: ${response.status} - ${text}`);
  }

  return response.json();
}
