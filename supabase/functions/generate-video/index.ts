
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
    const { readingId, avatarId = 'amy-jcwCkr1grs' } = await req.json();
    
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

    // Check subscription and video credits
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription || subscription.videos_remaining <= 0) {
      throw new Error('No video credits remaining. Please upgrade your subscription.');
    }

    // Create video record
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .insert({
        user_id: user.id,
        reading_id: readingId,
        avatar_id: avatarId,
        status: 'processing',
      })
      .select()
      .single();

    if (videoError) {
      throw new Error('Failed to create video record');
    }

    // Call D-ID API to create video
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Deno.env.get('DID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: reading.generated_text,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-JennyNeural',
          },
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
        },
        source_url: `https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/${avatarId}.jpg`,
      }),
    });

    const didData = await didResponse.json();
    
    if (!didResponse.ok) {
      throw new Error(`D-ID API error: ${didData.message || 'Unknown error'}`);
    }

    // Update video record with D-ID video ID
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({
        did_video_id: didData.id,
        status: 'processing',
      })
      .eq('id', video.id);

    if (updateError) {
      console.error('Failed to update video record:', updateError);
    }

    // Decrement video credits
    const { error: creditError } = await supabaseClient
      .from('subscriptions')
      .update({
        videos_remaining: subscription.videos_remaining - 1,
      })
      .eq('user_id', user.id);

    if (creditError) {
      console.error('Failed to update video credits:', creditError);
    }

    return new Response(JSON.stringify({ 
      video,
      didVideoId: didData.id,
      status: 'processing' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-video function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
