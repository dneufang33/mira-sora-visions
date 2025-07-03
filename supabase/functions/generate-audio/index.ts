
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Get user directly from Supabase Auth API
    const userResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      },
    });

    if (!userResponse.ok) throw new Error("Authentication failed");
    const userData = await userResponse.json();
    const user = userData;
    if (!user) throw new Error('User not authenticated');

    // Get reading data via REST API
    const readingResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/readings?id=eq.${readingId}&user_id=eq.${user.id}&select=*`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      },
    });

    const readingData = await readingResponse.json();
    const reading = readingData[0];
    if (!reading) throw new Error('Reading not found');

    // Create audio record via REST API
    const audioResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/audio_readings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        user_id: user.id,
        reading_id: readingId,
        status: 'processing',
      }),
    });

    const audioData = await audioResponse.json();
    const audio = audioData[0];
    if (!audio) throw new Error('Failed to create audio record');

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

    // Upload audio to Supabase Storage via REST API
    const fileName = `${audio.id}.mp3`;
    const uploadResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/storage/v1/object/audio-files/${fileName}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "audio/mpeg",
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      throw new Error('Failed to upload audio file');
    }

    // Get public URL for the audio file
    const publicUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/audio-files/${fileName}`;

    // Update audio record with file URL and completion status
    await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/audio_readings?id=eq.${audio.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: publicUrl,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({ 
      audio,
      audioUrl: publicUrl,
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
