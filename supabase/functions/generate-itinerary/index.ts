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
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json();
    
    console.log("Generating itinerary for:", { destination, startDate, endDate, travelers, interests, budget });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create a detailed prompt for the AI
    const prompt = `Create a detailed ${days}-day travel itinerary for ${destination} for ${travelers} traveler(s).

Travel Details:
- Dates: ${startDate} to ${endDate} (${days} days)
- Budget: ${budget}
- Interests: ${interests}

Please create a day-by-day itinerary that includes:
1. Morning, afternoon, and evening activities
2. Specific attractions, restaurants, and experiences
3. Practical tips and local recommendations
4. Travel time between locations
5. Budget-appropriate suggestions

Format the response with clear sections for each day (Day 1, Day 2, etc.) and use bullet points for activities.
Make it engaging, practical, and personalized to the traveler's interests.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert travel planner with deep knowledge of destinations worldwide. Create detailed, practical, and exciting travel itineraries that match the traveler's interests and budget.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const itinerary = data.choices?.[0]?.message?.content;

    if (!itinerary) {
      throw new Error("No itinerary generated");
    }

    console.log("Itinerary generated successfully");

    return new Response(
      JSON.stringify({ itinerary }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-itinerary function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
