
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
    const { readingId } = await req.json();
    
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

    // Get reading data
    const { data: reading, error: readingError } = await supabaseClient
      .from('readings')
      .select('*')
      .eq('id', readingId)
      .eq('user_id', user.id)
      .single();

    if (readingError || !reading) {
      throw new Error('Reading not found');
    }

    // Create audio record
    const { data: audio, error: audioError } = await supabaseClient
      .from('audio_readings')
      .insert({
        user_id: user.id,
        reading_id: readingId,
        status: 'processing',
      })
      .select()
      .single();

    if (audioError) {
      throw new Error('Failed to create audio record');
    }

    // Call DeepGram API to generate speech
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('DEEPGRAM_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: reading.generated_text,
      }),
    });

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      throw new Error(`DeepGram API error: ${errorText}`);
    }

    // Get the audio data as array buffer
    const audioBuffer = await deepgramResponse.arrayBuffer();
    const audioBlob = new Uint8Array(audioBuffer);

    // Upload audio to Supabase Storage
    const fileName = `${audio.id}.mp3`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('audio-files')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload audio file');
    }

    // Get public URL for the audio file
    const { data: urlData } = supabaseClient.storage
      .from('audio-files')
      .getPublicUrl(fileName);

    // Update audio record with file URL and completion status
    const { error: updateError } = await supabaseClient
      .from('audio_readings')
      .update({
        audio_url: urlData.publicUrl,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', audio.id);

    if (updateError) {
      console.error('Failed to update audio record:', updateError);
    }

    return new Response(JSON.stringify({ 
      audio,
      audioUrl: urlData.publicUrl,
      status: 'completed' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-audio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
