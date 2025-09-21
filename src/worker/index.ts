import { Hono, Context, Next } from "hono";
import { zValidator } from "@hono/zod-validator";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisRequestSchema, AnalysisReportSchema } from "../shared/types";
// Basic type definition for Cloudflare D1 Database
interface D1Result {
  results?: unknown[];
  success: boolean;
  meta: {
    duration: number;
    last_row_id?: number;
  };
}
interface D1PreparedStatement {
  bind(...values: (string | number | null)[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all(): Promise<D1Result>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

type Bindings = {
  OPENAI_API_KEY: string;
  GOOGLE_CLOUD_VISION_API_KEY: string;
  GOOGLE_GEMINI_API_KEY: string;
  DB: D1Database;
};

type HonoContext = {
  Bindings: Bindings;
  Variables: {
    user: { uid: string; email?: string; };
  };
};

const app = new Hono<HonoContext>();


// CORS middleware
app.use('*', async (c, next) => {
  await next();
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

app.options('*', (c) => {
  return c.body(null, 204);
});

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (requestsPerMinute: number) => {
  return async (c: Context<HonoContext>, next: Next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const now = Date.now();
    const windowStart = Math.floor(now / 60000) * 60000; // 1-minute windows
    const key = `${clientIP}:${windowStart}`;
    
    const current = rateLimitMap.get(key) || { count: 0, resetTime: windowStart + 60000 };
    
    if (now > current.resetTime) {
      // Reset the window
      current.count = 0;
      current.resetTime = windowStart + 60000;
    }
    
    current.count++;
    rateLimitMap.set(key, current);
    
    // Clean up old entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime + 60000) {
        rateLimitMap.delete(k);
      }
    }
    
    if (current.count > requestsPerMinute) {
      return c.json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
    }
    
    await next();
  };
};

const authMiddleware = async (c: Context<HonoContext>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Unauthorized: No Authorization header' }, 401);
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    return c.json({ error: 'Unauthorized: No Bearer token' }, 401);
  }

  try {
    // In a real-world scenario, you would verify the Firebase ID token here.
    // This typically involves fetching Google's public keys and using a JWT library
    // to verify the token's signature, expiration, and audience.
    // For this example, we'll simulate a successful verification.
    const decodedToken = { uid: 'simulated-user-id', email: 'simulated@example.com' }; // Replace with actual verification
    c.set('user', decodedToken);
    await next();
  } catch (error: unknown) {
    return c.json({ error: 'Unauthorized: Invalid token', details: (error as Error).message }, 401);
  }
};


// Health check endpoint
app.get("/api/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Text analysis endpoint (with rate limiting and optional auth)
app.post("/api/analyze-text", rateLimit(10), zValidator("json", AnalysisRequestSchema), async (c) => {
  try {
    const { content, contentType } = c.req.valid("json");
    const env = c.env;

    if (!env.OPENAI_API_KEY) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }

    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    // Create AI prompt for misinformation detection
    const systemPrompt = `You are Pi Shield, an expert AI system for detecting misinformation and analyzing content credibility. 

    Analyze the provided content and provide a comprehensive assessment including:
    1. Credibility score (0-100, where 100 is most credible)
    2. Detailed analysis of the content's reliability
    3. Red flags or warning signs if any
    4. Specific recommendations for verification
    5. Reasoning behind your assessment

    Consider factors like:
    - Source credibility indicators
    - Emotional language or bias
    - Factual claims that can be verified
    - Logical consistency
    - Evidence quality
    - Potential manipulation techniques

    Respond with a JSON object matching this exact structure:
    {
      "credibilityScore": number (0-100),
      "analysis": "detailed analysis string",
      "flags": ["array", "of", "warning", "flags"],
      "recommendations": ["array", "of", "verification", "steps"],
      "reasoning": "explanation of score and assessment"
    }`;

    const userPrompt = `Analyze this ${contentType} content for misinformation and credibility:

"${content}"

Provide your assessment in the specified JSON format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'analysis_report',
          schema: {
            type: 'object',
            properties: {
              credibilityScore: { type: 'number', minimum: 0, maximum: 100 },
              analysis: { type: 'string' },
              flags: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } },
              reasoning: { type: 'string' }
            },
            required: ['credibilityScore', 'analysis', 'flags', 'recommendations', 'reasoning'],
            additionalProperties: false
          },
          strict: true
        }
      },
      temperature: 0.3,
      max_completion_tokens: 1000
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No analysis received from AI");
    }

    const analysisResult = JSON.parse(analysisText);
    
    // Validate the response structure
    const validatedResult = AnalysisReportSchema.parse(analysisResult);

    const user = c.get('user');
    const userId = user ? user.uid : null;


    // Store in database
    const insertResult = await c.env.DB.prepare(`
      INSERT INTO analysis_reports (
        user_id, content_type, content_text, credibility_score, 
        analysis_result, flags, recommendations, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      contentType,
      content.substring(0, 1000), // Limit stored content length
      validatedResult.credibilityScore,
      validatedResult.analysis,
      JSON.stringify(validatedResult.flags),
      JSON.stringify(validatedResult.recommendations)
    ).run();

    return c.json({
      ...validatedResult,
      id: insertResult.meta.last_row_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({
      error: "Failed to analyze content",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Get educational tips
app.get("/api/educational-tips", async (c) => {
  try {
    const category = c.req.query("category");
    
    let query = "SELECT * FROM educational_tips";
    const params: (string | number)[] = [];
    
    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }
    
    query += " ORDER BY created_at DESC";
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({ tips: result.results || [] });
  } catch (error) {
    console.error('Educational tips error:', error);
    return c.json({ error: "Failed to fetch educational tips" }, 500);
  }
});

// Enhanced OCR text extraction endpoint with Gemini Vision support
app.post("/api/extract-text", rateLimit(5), async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return c.json({ error: "No image file provided" }, 400);
    }

    // Try Gemini Vision first if available, fallback to Google Cloud Vision
    if (c.env.GOOGLE_GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(c.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Convert file to base64 for Gemini
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Image = arrayBufferToBase64(arrayBuffer);

        const prompt = `Extract all text content from this image. Return only the text that appears in the image, preserving formatting and structure as much as possible. If no text is found, respond with "No text detected in the image."`;

        const imagePart = {
          inlineData: {
            data: base64Image,
            mimeType: imageFile.type,
          },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const extractedText = response.text();

        return c.json({
          extractedText: extractedText || 'No text detected in the image.',
          confidence: 0.95,
          message: "Text successfully extracted using Google Gemini Vision API"
        });
      } catch (geminiError) {
        console.error('Gemini Vision error, falling back to Google Cloud Vision:', geminiError);
        // Fall through to Google Cloud Vision fallback
      }
    }

    if (!c.env.GOOGLE_CLOUD_VISION_API_KEY) {
      // Fallback to simulated response if no API keys are configured
      return c.json({
        extractedText: "OCR functionality requires Google Cloud Vision API or Google Gemini API key configuration. This is simulated text extraction for demonstration purposes.",
        confidence: 0.95,
        message: "No vision API keys configured - using simulated response"
      });
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);

    // Call Google Cloud Vision API
    const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${c.env.GOOGLE_CLOUD_VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      })
    });

    if (!visionResponse.ok) {
      throw new Error(`Google Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json() as { responses: { textAnnotations: { description: string }[], error?: { message: string } }[] };
    
    if (visionData.responses?.[0]?.error) {
      throw new Error(`Vision API error: ${visionData.responses[0].error.message}`);
    }

    const textAnnotations = visionData.responses?.[0]?.textAnnotations || [];
    const extractedText = textAnnotations.length > 0 ? textAnnotations[0].description : '';
    
    return c.json({
      extractedText: extractedText || 'No text detected in the image.',
      confidence: textAnnotations.length > 0 ? 0.9 : 0.0,
      message: "Text successfully extracted using Google Cloud Vision API"
    });
    
  } catch (error) {
    console.error('OCR extraction error:', error);
    return c.json({
      error: "Failed to extract text from image",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Video metadata extraction endpoint
app.post("/api/extract-video-metadata", rateLimit(5), async (c) => {
  try {
    console.log('Starting video metadata extraction...');
    
    const formData = await c.req.formData();
    const videoFile = formData.get('video') as File;
    
    if (!videoFile) {
      console.error('No video file provided in request');
      return c.json({ error: "No video file provided" }, 400);
    }

    console.log(`Processing video file: ${videoFile.name}, size: ${videoFile.size} bytes, type: ${videoFile.type}`);

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      console.error(`Invalid file type: ${videoFile.type}`);
      return c.json({ error: "File must be a video format (MP4, AVI, MOV, etc.)" }, 400);
    }

    // Check file size (limit to 100MB for demo)
    const maxSizeBytes = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSizeBytes) {
      console.error(`File too large: ${videoFile.size} bytes (max: ${maxSizeBytes})`);
      return c.json({ error: "Video file is too large. Maximum size is 100MB." }, 400);
    }

    // Extract basic information from the file
    const fileSizeFormatted = formatFileSize(videoFile.size);
    const fileExtension = videoFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    
    // Simulate metadata extraction with more realistic data based on the actual file
    const metadata = {
      duration: estimateDurationFromSize(videoFile.size),
      resolution: estimateResolutionFromSize(videoFile.size),
      frameRate: "30 fps",
      format: fileExtension,
      codec: getCodecFromType(videoFile.type),
      creationDate: new Date().toISOString(),
      fileSize: fileSizeFormatted,
      bitrate: estimateBitrateFromSize(videoFile.size),
      originalFileName: videoFile.name,
      mimeType: videoFile.type
    };

    console.log('Video metadata extracted successfully:', metadata);
    
    return c.json({
      metadata,
      message: "Video metadata extraction completed (simulated for demo - integrate with FFmpeg or Google Cloud Video Intelligence API for production)"
    });
  } catch (error) {
    console.error('Video metadata extraction error:', error);
    return c.json({
      error: "Failed to extract video metadata",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

// Helper functions for video metadata estimation
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function estimateDurationFromSize(sizeBytes: number): string {
  // Rough estimation: assume 2Mbps average bitrate
  const avgBitrateBps = 2 * 1024 * 1024 / 8; // 2Mbps in bytes per second
  const durationSeconds = Math.floor(sizeBytes / avgBitrateBps);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function estimateResolutionFromSize(sizeBytes: number): string {
  // Rough estimation based on file size
  if (sizeBytes > 50 * 1024 * 1024) return "1920x1080"; // 50MB+ likely 1080p
  if (sizeBytes > 20 * 1024 * 1024) return "1280x720";  // 20MB+ likely 720p
  if (sizeBytes > 5 * 1024 * 1024) return "854x480";    // 5MB+ likely 480p
  return "640x360"; // smaller files likely 360p
}

function estimateBitrateFromSize(sizeBytes: number): string {
  // Rough estimation
  const sizeMB = sizeBytes / (1024 * 1024);
  if (sizeMB > 50) return "3.5 Mbps";
  if (sizeMB > 20) return "2.5 Mbps";
  if (sizeMB > 5) return "1.5 Mbps";
  return "1.0 Mbps";
}

function getCodecFromType(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'H.264';
  if (mimeType.includes('webm')) return 'VP8/VP9';
  if (mimeType.includes('avi')) return 'XVID';
  if (mimeType.includes('mov')) return 'H.264';
  return 'Unknown';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Video analysis endpoint
app.post("/api/analyze-video", rateLimit(3), async (c) => {
  try {
    console.log('Starting video analysis...');
    
    const requestBody = await c.req.json();
    const { filename, metadata } = requestBody;
    
    console.log(`Analyzing video: ${filename}`);
    console.log('Metadata received:', metadata);

    // Validate input
    if (!filename) {
      console.error('No filename provided');
      return c.json({ error: "Video filename is required" }, 400);
    }

    if (!metadata) {
      console.error('No metadata provided');
      return c.json({ error: "Video metadata is required. Please extract metadata first." }, 400);
    }

    const env = c.env;
    if (!env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return c.json({ error: "AI analysis service not configured" }, 500);
    }

    console.log('Initializing OpenAI client...');
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    const systemPrompt = `You are Pi Shield, an expert AI system for detecting misinformation in video content based on metadata analysis.

    Analyze the provided video metadata and filename to assess potential misinformation risks, considering:
    - Video quality and technical specifications that might indicate manipulation
    - File creation patterns typical of manipulated content
    - Metadata inconsistencies that might indicate editing or deepfake generation
    - Resolution and quality patterns associated with AI-generated or heavily edited content
    - Suspicious encoding, compression, or format choices
    - Filename patterns that might suggest automated generation or batch processing

    Provide a comprehensive assessment focusing on technical forensics and metadata analysis.
    Be thorough but balanced - not all videos with certain technical characteristics are necessarily misinformation.

    Respond with a JSON object matching this exact structure:
    {
      "credibilityScore": number (0-100, where 100 is most credible),
      "analysis": "detailed technical analysis of the video metadata and potential indicators",
      "flags": ["array of specific warning signs or suspicious technical indicators"],
      "recommendations": ["array of verification steps and technical checks to perform"],
      "reasoning": "detailed explanation of the score and technical assessment"
    }`;

    const userPrompt = `Analyze this video for potential misinformation based on its metadata and technical characteristics:

    Filename: ${filename}    
    Video Metadata:
    ${JSON.stringify(metadata, null, 2)}

    Focus on technical forensics, metadata analysis, and any patterns that might suggest content manipulation, AI generation, or other suspicious characteristics. Provide specific technical reasoning for your assessment.`;

    console.log('Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'video_analysis_report',
          schema: {
            type: 'object',
            properties: {
              credibilityScore: { type: 'number', minimum: 0, maximum: 100 },
              analysis: { type: 'string' },
              flags: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } },
              reasoning: { type: 'string' }
            },
            required: ['credibilityScore', 'analysis', 'flags', 'recommendations', 'reasoning'],
            additionalProperties: false
          },
          strict: true
        }
      },
      temperature: 0.3,
      max_completion_tokens: 1000
    });

    console.log('OpenAI response received');
    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      console.error('No analysis content received from OpenAI');
      throw new Error("No analysis received from AI service");
    }

    console.log('Parsing analysis result...');
    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', analysisText);
      throw new Error("Invalid response format from AI service");
    }

    // Validate the structure
    if (typeof analysisResult.credibilityScore !== 'number' || 
        !analysisResult.analysis || 
        !Array.isArray(analysisResult.flags) || 
        !Array.isArray(analysisResult.recommendations) || 
        !analysisResult.reasoning) {
      console.error('Invalid analysis result structure:', analysisResult);
      throw new Error("Invalid analysis result structure");
    }

    console.log('Analysis completed successfully. Score:', analysisResult.credibilityScore);

    const user = c.get('user');
    const userId = user ? user.uid : null;

    // Store in database
    console.log('Storing analysis result in database...');
    try {
      await c.env.DB.prepare(`
        INSERT INTO analysis_reports (
          user_id, content_type, content_text, credibility_score, 
          analysis_result, flags, recommendations, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        userId,
        'video',
        `Video: ${filename}`,
        analysisResult.credibilityScore,
        analysisResult.analysis,
        JSON.stringify(analysisResult.flags),
        JSON.stringify(analysisResult.recommendations)
      ).run();
      console.log('Analysis result stored successfully');
    } catch (dbError) {
      console.error('Database storage error:', dbError);
      // Continue and return result even if storage fails
    }

    return c.json({
      ...analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video analysis error:', error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to analyze video";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = "AI analysis service configuration error";
        statusCode = 500;
      } else if (error.message.includes('Invalid response')) {
        errorMessage = "AI analysis service returned invalid response";
        statusCode = 502;
      } else if (error.message.includes('required')) {
        errorMessage = error.message;
        statusCode = 400;
      } else {
        errorMessage = `Analysis failed: ${error.message}`;
      }
    }
    
    return c.json({
      error: errorMessage,
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, statusCode as any);
  }
});

// Get analysis history (protected route for authenticated users)
app.get("/api/analysis-history", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }
    
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
    const offset = parseInt(c.req.query("offset") || "0");
    
    const result = await c.env.DB.prepare(`
      SELECT 
        id, content_type, credibility_score, 
        substr(content_text, 1, 200) as content_preview,
        created_at
      FROM analysis_reports 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(user.uid, limit, offset).all();
    
    return c.json({
      analyses: result.results || [],
      hasMore: result.results?.length === limit
    });
  } catch (error) {
    console.error('History error:', error);
    return c.json({ error: "Failed to fetch analysis history" }, 500);
  }
});

// Get public analysis history for anonymous users
app.get("/api/analysis-history/public", async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query("limit") || "10"), 50);
    const offset = parseInt(c.req.query("offset") || "0");
    
    // Only show recent anonymous analyses (no user_id)
    const result = await c.env.DB.prepare(`
      SELECT 
        id, content_type, credibility_score, 
        substr(content_text, 1, 100) as content_preview,
        created_at
      FROM analysis_reports 
      WHERE user_id IS NULL
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return c.json({
      analyses: result.results || [],
      hasMore: result.results?.length === limit
    });
  } catch (error) {
    console.error('Public history error:', error);
    return c.json({ error: "Failed to fetch public analysis history" }, 500);
  }
});

// Enhanced multimodal analysis endpoint using Google Gemini
app.post("/api/analyze-multimodal", rateLimit(5), async (c) => {
  try {
    const formData = await c.req.formData();
    const contentType = formData.get('contentType') as string;
    const analysisPrompt = formData.get('analysisPrompt') as string || 'Analyze this content for misinformation and credibility.';
    
    if (!c.env.GOOGLE_GEMINI_API_KEY) {
      return c.json({ error: "Google Gemini API key not configured" }, 500);
    }

    const genAI = new GoogleGenerativeAI(c.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are Pi Shield, an expert AI system for detecting misinformation and analyzing content credibility.

    Analyze the provided content and provide a comprehensive assessment including:
    1. Credibility score (0-100, where 100 is most credible)
    2. Detailed analysis of the content's reliability
    3. Red flags or warning signs if any
    4. Specific recommendations for verification
    5. Reasoning behind your assessment

    Consider factors like:
    - Source credibility indicators
    - Emotional language or bias
    - Factual claims that can be verified
    - Logical consistency
    - Evidence quality
    - Potential manipulation techniques
    - For images: visual manipulation, deepfakes, misleading context
    - For videos: metadata inconsistencies, technical artifacts
    - For audio: voice synthesis, audio manipulation

    Respond in JSON format with this exact structure:
    {
      "credibilityScore": number (0-100),
      "analysis": "detailed analysis string",
      "flags": ["array", "of", "warning", "flags"],
      "recommendations": ["array", "of", "verification", "steps"],
      "reasoning": "explanation of score and assessment"
    }

    ${analysisPrompt}`;

    const parts: (string | { inlineData: { data: string; mimeType: string; } })[] = [prompt];

    // Handle different content types
    if (contentType === 'image') {
      const imageFile = formData.get('image') as File;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64Image = arrayBufferToBase64(arrayBuffer);
        
        parts.push({
          inlineData: {
            data: base64Image,
            mimeType: imageFile.type,
          },
        });
      }
    } else if (contentType === 'video') {
      const videoFile = formData.get('video') as File;
      if (videoFile) {
        const arrayBuffer = await videoFile.arrayBuffer();
        const base64Video = arrayBufferToBase64(arrayBuffer);
        
        parts.push({
          inlineData: {
            data: base64Video,
            mimeType: videoFile.type,
          },
        });
      }
    } else if (contentType === 'audio') {
      const audioFile = formData.get('audio') as File;
      if (audioFile) {
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = arrayBufferToBase64(arrayBuffer);
        
        parts.push({
          inlineData: {
            data: base64Audio,
            mimeType: audioFile.type,
          },
        });
      }
    } else {
      // Text content
      const textContent = formData.get('content') as string;
      if (textContent) {
        parts[0] += `\n\nAnalyze this ${contentType} content: "${textContent}"`;
      }
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    let analysisText = response.text();

    // Clean up the response to extract JSON
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysisText = jsonMatch[0];
    }

    const analysisResult = JSON.parse(analysisText);
    
    // Validate the response structure
    const validatedResult = AnalysisReportSchema.parse(analysisResult);

    const user = c.get('user');
    const userId = user ? user.uid : null;

    // Store in database
    const contentDescription = contentType === 'text' ? 
      (formData.get('content') as string)?.substring(0, 1000) : 
      `${contentType} content analysis`;

    await c.env.DB.prepare(`
      INSERT INTO analysis_reports (
        user_id, content_type, content_text, credibility_score, 
        analysis_result, flags, recommendations, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      contentType,
      contentDescription,
      validatedResult.credibilityScore,
      validatedResult.analysis,
      JSON.stringify(validatedResult.flags),
      JSON.stringify(validatedResult.recommendations)
    ).run();

    return c.json({
      ...validatedResult,
      timestamp: new Date().toISOString(),
      aiModel: "Google Gemini 1.5 Flash"
    });

  } catch (error) {
    console.error('Multimodal analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes('API key not valid')) {
        return c.json({
            error: "Invalid Google Gemini API Key",
            details: "The provided API key is not valid. Please check your .dev.vars file."
        }, 401);
    }

    return c.json({
      error: "Failed to analyze content",
      details: errorMessage
    }, 500);
  }
});

// Enhanced image analysis endpoint using Gemini's native vision capabilities
app.post("/api/analyze-image-gemini", rateLimit(5), async (c) => {
  try {
    const formData = await c.req.formData();
    const imageFile = formData.get('image') as File;
    
    if (!imageFile) {
      return c.json({ error: "No image file provided" }, 400);
    }

    if (!c.env.GOOGLE_GEMINI_API_KEY) {
      return c.json({ error: "Google Gemini API key not configured" }, 500);
    }

    const genAI = new GoogleGenerativeAI(c.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = arrayBufferToBase64(arrayBuffer);

    const prompt = `You are Pi Shield, an expert AI system for detecting misinformation in images.

    Analyze this image comprehensively for potential misinformation, considering:
    
    1. Visual content analysis:
       - What does the image show? Describe the main elements
       - Are there any obvious signs of manipulation, editing, or fakery?
       - Does the image quality, lighting, or composition suggest artificial generation?
       
    2. Text extraction and analysis:
       - Extract and analyze any text visible in the image
       - Check for misleading headlines, false claims, or propaganda
       - Identify emotional manipulation through text
       
    3. Technical forensics:
       - Look for compression artifacts, inconsistent lighting, or other technical indicators
       - Check for deepfake indicators or AI-generated content signs
       - Assess image metadata consistency
       
    4. Context and credibility assessment:
       - Does the image appear genuine or manipulated?
       - Are there red flags suggesting misinformation?
       - What verification steps would be recommended?

    Respond in JSON format with this exact structure:
    {
      "credibilityScore": number (0-100),
      "analysis": "detailed analysis of the image content and potential issues",
      "flags": ["array", "of", "specific", "warning", "flags"],
      "recommendations": ["array", "of", "verification", "steps"],
      "reasoning": "detailed explanation of the assessment and score",
      "extractedText": "any text found in the image",
      "technicalFindings": "technical analysis of image quality and potential manipulation"
    }`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.type,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let analysisText = response.text();

    // Clean up the response to extract JSON
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      analysisText = jsonMatch[0];
    }

    const analysisResult = JSON.parse(analysisText);

    const user = c.get('user');
    const userId = user ? user.uid : null;

    // Store in database
    await c.env.DB.prepare(`
      INSERT INTO analysis_reports (
        user_id, content_type, content_text, credibility_score, 
        analysis_result, flags, recommendations, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      userId,
      'image',
      `Image analysis: ${imageFile.name}`,
      analysisResult.credibilityScore || 50,
      analysisResult.analysis || 'Analysis completed',
      JSON.stringify(analysisResult.flags || []),
      JSON.stringify(analysisResult.recommendations || [])
    ).run();

    return c.json({
      ...analysisResult,
      timestamp: new Date().toISOString(),
      aiModel: "Google Gemini 1.5 Flash Vision",
      filename: imageFile.name
    });

  } catch (error) {
    console.error('Gemini image analysis error:', error);
    return c.json({
      error: "Failed to analyze image",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
});

export default app;