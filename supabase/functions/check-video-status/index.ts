
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
    const { videoId } = await req.json();
    
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

    // Get video record
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (videoError || !video) {
      throw new Error('Video not found');
    }

    if (!video.did_video_id) {
      throw new Error('D-ID video ID not found');
    }

    // Check D-ID API for video status
    const didResponse = await fetch(`https://api.d-id.com/talks/${video.did_video_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Deno.env.get('DID_API_KEY')}`,
      },
    });

    const didData = await didResponse.json();
    
    if (!didResponse.ok) {
      throw new Error(`D-ID API error: ${didData.message || 'Unknown error'}`);
    }

    // Update video record with latest status
    const updateData: any = {
      status: didData.status,
    };

    if (didData.status === 'done' && didData.result_url) {
      updateData.video_url = didData.result_url;
      updateData.completed_at = new Date().toISOString();
      if (didData.duration) {
        updateData.duration = Math.round(didData.duration);
      }
    }

    const { error: updateError } = await supabaseClient
      .from('videos')
      .update(updateData)
      .eq('id', videoId);

    if (updateError) {
      console.error('Failed to update video record:', updateError);
    }

    return new Response(JSON.stringify({ 
      status: didData.status,
      videoUrl: didData.result_url,
      duration: didData.duration 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-video-status function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
