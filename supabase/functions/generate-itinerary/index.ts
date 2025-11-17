import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GenerateBody = {
  origin?: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  travelers: string | number;
  interests: string;
  budget: string;
  transportMode?: string;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, startDate, endDate, travelers, interests, budget, transportMode } = (await req.json()) as GenerateBody;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Compute trip length (1-based inclusive)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const systemPrompt = "You are an expert travel planner. Always return structured results via the provided function tool. Times must be realistic and chronological. Keep descriptions concise.";

    // Define a tool to force structured output
    const tools = [
      {
        type: "function",
        function: {
          name: "return_itinerary",
          description: "Return a complete, structured itinerary for the given trip.",
          parameters: {
            type: "object",
            properties: {
              destination: { type: "string" },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "integer", minimum: 1 },
                    date: { type: "string", description: "ISO date YYYY-MM-DD" },
                    summary: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          type: { type: "string", enum: ["activity", "meal", "transport", "evening"] },
                          timeStart: { type: "string", description: "HH:MM 24h" },
                          timeEnd: { type: "string", description: "HH:MM 24h", nullable: true },
                          location: { type: "string" },
                          cost: { type: "string", description: "Estimated cost incl. currency", nullable: true },
                          description: { type: "string" },
                          highlights: { type: "array", items: { type: "string" } },
                        },
                        required: ["title", "type", "timeStart", "location", "description", "highlights"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["day", "items"],
                  additionalProperties: false,
                },
              },
            },
            required: ["destination", "days"],
            additionalProperties: false,
          },
        },
      },
    ];

    const userPrompt = `Create a ${days}-day itinerary for traveling from ${origin || 'current location'} to ${destination} for ${travelers} traveler(s).
Dates: ${startDate} to ${endDate}
Budget: ${budget}
Preferred Transport: ${transportMode || 'any'}
Interests: ${interests}

Rules:
- For each day, produce 3–5 items following this sequence when possible: Morning activity, Midday activity, Meal, Afternoon/Evening activity.
- Include realistic times (e.g., 09:00–11:00), location names, short descriptions, and 2–4 bullet highlights.
- Costs should be concise in Indian Rupees (e.g., "₹600", "₹1000-1500", "Free").
- When suggesting transport between locations, prefer ${transportMode || 'any available'} mode of transport.
- Consider the journey from ${origin || 'origin'} to ${destination} when planning transport options.
- Optimize for minimal backtracking between locations.
- Use local, authentic options aligned to the budget.
`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "return_itinerary" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const raw = await aiResp.json();

    // Try to extract tool call arguments
    let itinerary_json: unknown | null = null;
    try {
      const toolCalls = raw.choices?.[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        const argStr = toolCalls[0]?.function?.arguments;
        if (typeof argStr === "string") {
          itinerary_json = JSON.parse(argStr);
        }
      }
    } catch (e) {
      console.warn("Failed to parse tool arguments:", e);
    }

    // Fallback: attempt to parse content as JSON (if model didn't use tool calling)
    if (!itinerary_json) {
      const content = raw.choices?.[0]?.message?.content as string | undefined;
      if (!content) throw new Error("No itinerary content returned");
      const cleaned = content.trim().replace(/^```(json)?/i, "").replace(/```$/, "");
      try {
        itinerary_json = JSON.parse(cleaned);
      } catch {
        // As last resort, wrap plain text
        itinerary_json = {
          destination,
          days: Array.from({ length: days }, (_, i) => ({ day: i + 1, summary: "", items: [] })),
          raw: content,
        };
      }
    }

    return new Response(JSON.stringify({ itinerary_json }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error in generate-itinerary:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
