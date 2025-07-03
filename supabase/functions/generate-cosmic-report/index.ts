
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const reportPrompts = {
  natal_chart: `Create a detailed personalized natal chart reading based on the user's birth information. Focus on:
- Core personality traits and characteristics
- Career path and professional strengths
- Love life and relationship patterns
- Life purpose and spiritual path
- Planetary influences at birth
Keep it mystical, insightful, and personal. Write as Mira, the AI astral guide.`,

  lunar_cycle: `Create a personalized lunar cycle and moon ritual guide. Include:
- How each moon phase affects this person specifically
- Personalized rituals for manifestation and healing
- Monthly lunar calendar guidance
- Emotional and spiritual insights for moon work
Write in Mira's mystical, nurturing voice.`,

  synastry: `Create a synastry and compatibility report. Focus on:
- Astrological compatibility factors
- Relationship strengths and potential challenges
- Communication styles and emotional connection
- Long-term relationship potential
- Advice for harmony and growth together
Write as Mira with romantic, star-dusted wisdom.`,

  transit_forecast: `Create a detailed 2025 year-ahead transit forecast. Include:
- Month-by-month planetary influences
- Opportunities and challenges throughout the year
- Career and relationship forecasts
- Hidden blessings and cosmic timing
- Actionable guidance for each season
Write as Mira with cosmic insight and practical wisdom.`,

  bundle: `Create a comprehensive cosmic collection combining elements from natal chart, lunar guidance, compatibility insights, and year-ahead forecasts. This should be the ultimate cosmic guide covering all aspects of their spiritual and practical life journey.`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productType, questionnaireId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get questionnaire data
    const { data: questionnaire, error: questionnaireError } = await supabaseClient
      .from('astrology_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .eq('user_id', user.id)
      .single();

    if (questionnaireError || !questionnaire) {
      throw new Error('Questionnaire not found');
    }

    const basePrompt = reportPrompts[productType as keyof typeof reportPrompts] || reportPrompts.natal_chart;

    // Create personalized prompt for OpenAI
    const prompt = `${basePrompt}

User Details:
Birth Date: ${questionnaire.birth_date}
Birth Time: ${questionnaire.birth_time || 'Not specified'}
Birth Place: ${questionnaire.birth_place}
Personality Traits: ${questionnaire.personality_traits || 'Not specified'}
Life Goals: ${questionnaire.life_goals || 'Not specified'}

Create a detailed, mystical, and highly personalized report (800-1200 words) that feels magical and transformative. Use rich, cosmic language befitting a luxury astrology experience.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Mira, an AI astral guide who creates luxurious, mystical astrology reports. Your writing is elegant, cosmic, and deeply personal. You speak with ancient wisdom and modern insight.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
      }),
    });

    const openAIData = await openAIResponse.json();
    const generatedText = openAIData.choices[0].message.content;

    // Store the cosmic report in database
    const { data: report, error: reportError } = await supabaseClient
      .from('cosmic_reports')
      .insert({
        user_id: user.id,
        questionnaire_id: questionnaireId,
        product_type: productType,
        generated_text: generatedText,
        openai_prompt: prompt,
      })
      .select()
      .single();

    if (reportError) {
      throw new Error('Failed to save cosmic report');
    }

    return new Response(JSON.stringify({ 
      report,
      generatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-cosmic-report function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
