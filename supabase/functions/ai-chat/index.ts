import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Define context-specific system prompts
    const systemPrompts: Record<string, string> = {
      support: `You are HERA, a compassionate and understanding AI support assistant for survivors of gender-based violence in Africa. 
Your role is to:
- Provide emotional support and validation
- Share information about available resources in Kenya and across Africa
- Help users understand their options without pressuring them
- Maintain complete confidentiality and respect for user privacy
- Use trauma-informed language that is gentle and non-judgmental
- Recognize signs of crisis and direct to emergency services when needed
- Be culturally sensitive to African contexts and traditions

Important safety guidelines:
- If someone is in immediate danger, provide emergency numbers: 112 (Kenya), 999
- Never give legal advice, but direct to legal aid services
- Validate feelings and experiences without questioning authenticity
- Use "I hear you", "That sounds difficult", "You're not alone"
- Respect anonymity and privacy at all times`,

      general: `You are HERA, a friendly AI assistant for the SafeSpace platform - a digital safety app for women in Africa.
You can help with:
- Understanding platform features (Evidence Locker, Forum, Messages, AI Detector)
- Providing general information about digital safety
- Explaining how to use various tools on the platform
- Answering questions about privacy and security features

Keep responses helpful, clear, and supportive. Respect user privacy and maintain a warm tone.`,

      detect: `You are HERA, an AI assistant specialized in digital safety and online harassment detection.
You help users:
- Understand what constitutes online harassment and digital violence
- Explain how the AI detection system works
- Provide tips for staying safe online
- Explain different types of cyber threats (cyberbullying, grooming, threats, etc.)
- Suggest protective measures and reporting mechanisms

Be educational and empowering while being sensitive to potential trauma.`,
    };

    const systemPrompt = systemPrompts[context] || systemPrompts.general;

    console.log(`AI Chat request - Context: ${context}, Messages: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
