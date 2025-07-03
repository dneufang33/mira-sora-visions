
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const generateReportContent = async (reportType: string, userInfo: any) => {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) throw new Error("OpenAI API key not configured");

  let prompt = "";
  
  switch (reportType) {
    case 'natal_chart':
      prompt = `Generate a detailed personalized natal chart reading for someone born on ${userInfo.birth_date} at ${userInfo.birth_time || 'unknown time'} in ${userInfo.birth_place}. Include insights about personality, career path, and love life. Make it mystical and engaging, around 2000 words.`;
      break;
    case 'lunar_cycle':
      prompt = `Generate a lunar cycle and moon ritual guide for someone born on ${userInfo.birth_date}. Explain how each moon phase affects them personally and provide specific rituals for manifestation, reflection, and healing. Make it sacred and powerful, around 1500 words.`;
      break;
    case 'synastry':
      prompt = `Generate a synastry and compatibility report for someone born on ${userInfo.birth_date} at ${userInfo.birth_time || 'unknown time'} in ${userInfo.birth_place}. Explain their relationship patterns, what they need in love, and how they connect with others. Make it romantic and insightful, around 1800 words.`;
      break;
    case 'transit_forecast':
      prompt = `Generate a 2025 year-ahead transit forecast for someone born on ${userInfo.birth_date} at ${userInfo.birth_time || 'unknown time'} in ${userInfo.birth_place}. Provide month-by-month insights about opportunities, challenges, and hidden blessings. Make it detailed and forward-looking, around 2500 words.`;
      break;
    case 'bundle':
      // For bundle, we'll generate all four reports
      const natalChart = await generateSingleReport('natal_chart', userInfo);
      const lunarCycle = await generateSingleReport('lunar_cycle', userInfo);
      const synastry = await generateSingleReport('synastry', userInfo);
      const transitForecast = await generateSingleReport('transit_forecast', userInfo);
      
      return `# 🌟 Complete Celestial Collection 🌟

Welcome to your complete cosmic journey! This collection contains four powerful reports that will illuminate every aspect of your celestial destiny.

---

## 🔮 Personalized Natal Chart Reading

${natalChart}

---

## 🌕 Lunar Cycle & Moon Ritual Guide

${lunarCycle}

---

## 💞 Synastry & Compatibility Report

${synastry}

---

## 🪐 2025 Year-Ahead Transit Forecast

${transitForecast}

---

*Generated with cosmic love by Mira, your AI Astral Guide*`;
    default:
      throw new Error("Invalid report type");
  }

  return await generateSingleReport(reportType, userInfo, prompt);
};

const generateSingleReport = async (reportType: string, userInfo: any, customPrompt?: string) => {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  
  const prompt = customPrompt || `Generate a detailed ${reportType} report for someone born on ${userInfo.birth_date}.`;
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-2025-04-14",
      messages: [
        {
          role: "system",
          content: "You are Mira, a mystical AI astrologer. Create beautiful, insightful, and engaging astrological content that feels magical and personal."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    }),
  });

  const openaiData = await response.json();
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${openaiData.error?.message || 'Unknown error'}`);
  }

  return openaiData.choices[0].message.content;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error("User not authenticated");

    const { productId, productType } = await req.json();

    // Get user's birth information from questionnaire
    const { data: questionnaire, error: questionnaireError } = await supabaseClient
      .from('astrology_questionnaires')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (questionnaireError || !questionnaire) {
      throw new Error("User questionnaire not found. Please complete your birth information first.");
    }

    // Generate the report content
    const reportContent = await generateReportContent(productType, questionnaire);

    // Store the report in the cosmic_reports table
    const { data: report, error: reportError } = await supabaseClient
      .from('cosmic_reports')
      .insert({
        user_id: user.id,
        product_id: productId,
        product_type: productType,
        content: reportContent,
        status: 'completed'
      })
      .select()
      .single();

    if (reportError) throw reportError;

    return new Response(JSON.stringify({ 
      success: true, 
      reportId: report.id,
      message: "Cosmic report generated successfully!" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Generate cosmic report error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
