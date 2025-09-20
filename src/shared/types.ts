import z from "zod";

// Analysis Types
export const AnalysisRequestSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters"),
  contentType: z.enum(["text", "article", "post", "news"]),
});

export const AnalysisResultSchema = z.object({
  id: z.number(),
  contentType: z.string(),
  contentText: z.string(),
  credibilityScore: z.number().min(0).max(100),
  analysisResult: z.string(),
  flags: z.array(z.string()),
  recommendations: z.array(z.string()),
  createdAt: z.string(),
});

export const AnalysisReportSchema = z.object({
  credibilityScore: z.number().min(0).max(100),
  analysis: z.string(),
  flags: z.array(z.string()),
  recommendations: z.array(z.string()),
  reasoning: z.string(),
  sources: z.array(z.string()).optional(),
});

// Educational Content Types
export const EducationalTipSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.enum(["deepfakes", "misleading_headlines", "source_verification", "bias_detection"]),
  createdAt: z.string(),
});

// Export inferred types
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;
export type EducationalTip = z.infer<typeof EducationalTipSchema>;
