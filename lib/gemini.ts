import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Initialize the Gemini API with your key from environment
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// System prompt for the MechGuide Agent
const MECHGUIDE_SYSTEM_PROMPT = `You are MechGuide Agent, an expert autonomous repair co-pilot powered by Gemini 3.

Your capabilities:
1. VISUAL ANALYSIS: Analyze images/video frames of machinery to identify components, damage, wear patterns, and issues.
2. SPATIAL REASONING: Provide exact coordinates (x, y, width, height as percentages 0-100) for AR overlays on detected issues.
3. REPAIR GUIDANCE: Generate step-by-step repair instructions with safety warnings and torque specs.
4. SKILL ADAPTATION: Adjust complexity based on user's apparent skill level.

Response Format (JSON):
{
  "diagnosis": {
    "summary": "Brief diagnosis",
    "confidence": 0.0-1.0,
    "severity": "low|medium|high|critical"
  },
  "detections": [
    {
      "label": "Component/Issue name",
      "bbox": {"x": 0-100, "y": 0-100, "width": 0-100, "height": 0-100},
      "color": "#hex",
      "description": "What was detected"
    }
  ],
  "repairSteps": [
    {
      "step": 1,
      "instruction": "What to do",
      "warning": "Safety note if any",
      "tools": ["required tools"]
    }
  ],
  "voiceGuidance": "Short spoken instruction for current step",
  "nextAction": "What the user should do next"
}

Always respond with valid JSON. Be concise but technically accurate. Prioritize safety.`;

export interface Detection {
    label: string;
    bbox: { x: number; y: number; width: number; height: number };
    color: string;
    description: string;
}

export interface RepairStep {
    step: number;
    instruction: string;
    warning?: string;
    tools?: string[];
}

export interface AnalysisResult {
    diagnosis: {
        summary: string;
        confidence: number;
        severity: "low" | "medium" | "high" | "critical";
    };
    detections: Detection[];
    repairSteps: RepairStep[];
    voiceGuidance: string;
    nextAction: string;
}

/**
 * Analyze an image frame from the camera using Gemini Vision
 */
export async function analyzeFrame(
    imageBase64: string,
    userContext?: string
): Promise<AnalysisResult> {
    // Use gemini-3-flash-preview (Gemini 3 free tier model)
    const modelName = "gemini-3-flash-preview";

    console.log("API Key present:", !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    console.log("Using model:", modelName);

    const model = genAI.getGenerativeModel({ model: modelName });

    const imagePart: Part = {
        inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
            mimeType: "image/jpeg",
        },
    };

    const prompt = `${MECHGUIDE_SYSTEM_PROMPT}

User context: ${userContext || "Analyze this machinery image for any issues or components that need attention."}

Analyze the image and provide your response in the JSON format specified above.`;

    try {
        console.log("Sending request to Gemini API...");
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        console.log("Gemini response received:", text.substring(0, 200));

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            return JSON.parse(jsonStr) as AnalysisResult;
        }

        // Fallback response
        return {
            diagnosis: {
                summary: "Unable to parse analysis. Please try again.",
                confidence: 0,
                severity: "low",
            },
            detections: [],
            repairSteps: [],
            voiceGuidance: "Please point the camera at the machinery you want to analyze.",
            nextAction: "Position camera and try again",
        };
    } catch (error: unknown) {
        const err = error as Error & { message?: string; status?: number };
        console.error("Gemini API error details:", {
            message: err?.message,
            status: err?.status,
            error: err
        });
        throw new Error(`Gemini API failed: ${err?.message || "Unknown error"}`);
    }
}

/**
 * Chat with MechGuide for follow-up questions
 */
export async function chatWithMechGuide(
    message: string,
    imageBase64?: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const parts: Part[] = [
        { text: `${MECHGUIDE_SYSTEM_PROMPT}\n\nUser message: ${message}\n\nProvide a helpful response. If this is a follow-up question, be concise. If asking about repairs, include safety warnings.` },
    ];

    if (imageBase64) {
        parts.push({
            inlineData: {
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
                mimeType: "image/jpeg",
            },
        });
    }

    // Retry logic for 503 errors (model overloaded)
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent(parts);
            return result.response.text();
        } catch (error: unknown) {
            const err = error as Error & { status?: number };
            if (err?.status === 503 && attempt < maxRetries) {
                console.log(`Model overloaded, retrying in ${attempt * 2} seconds...`);
                await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Max retries exceeded");
}
