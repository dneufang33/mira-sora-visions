
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireId } = await req.json();
    
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

    // Create personalized prompt for OpenAI
    const prompt = `Create a personalized astrology reading for someone with the following details:
    
Birth Date: ${questionnaire.birth_date}
Birth Time: ${questionnaire.birth_time || 'Not specified'}
Birth Place: ${questionnaire.birth_place}
Personality Traits: ${questionnaire.personality_traits || 'Not specified'}
Life Goals: ${questionnaire.life_goals || 'Not specified'}

Please create a mystical, insightful, and personal astrology reading that addresses their cosmic path, planetary influences, and guidance for their life journey. The reading should be conversational, warm, and spoken as if by an AI astral guide named Mira. Keep it between 200-300 words and suitable for video narration.`;

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
            content: 'You are Mira, an AI astral guide who provides personalized astrology readings. Your tone is mystical, warm, and insightful. You speak directly to the person as if channeling cosmic wisdom.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
      }),
    });

    const openAIData = await openAIResponse.json();
    const generatedText = openAIData.choices[0].message.content;

    // Store the reading in database
    const { data: reading, error: readingError } = await supabaseClient
      .from('readings')
      .insert({
        user_id: user.id,
        questionnaire_id: questionnaireId,
        generated_text: generatedText,
        openai_prompt: prompt,
      })
      .select()
      .single();

    if (readingError) {
      throw new Error('Failed to save reading');
    }

    return new Response(JSON.stringify({ 
      reading,
      generatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-reading function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
