
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Video, Clock, CheckCircle } from 'lucide-react';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

const Dashboard = ({ user, onSignOut }: DashboardProps) => {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionnairesRes, readingsRes, videosRes, subscriptionRes] = await Promise.all([
        supabase.from('astrology_questionnaires').select('*').order('created_at', { ascending: false }),
        supabase.from('readings').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').single(),
      ]);

      if (questionnairesRes.error) throw questionnairesRes.error;
      if (readingsRes.error) throw readingsRes.error;
      if (videosRes.error) throw videosRes.error;

      setQuestionnaires(questionnairesRes.data || []);
      setReadings(readingsRes.data || []);
      setVideos(videosRes.data || []);
      setSubscription(subscriptionRes.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReading = async (questionnaireId: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-reading', {
        body: { questionnaireId }
      });

      if (error) throw error;

      toast({
        title: "Reading generated!",
        description: "Your personalized astrology reading has been created.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error generating reading",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateVideo = async (readingId: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { readingId }
      });

      if (error) throw error;

      toast({
        title: "Video generation started!",
        description: "Your avatar video is being created. This may take a few minutes.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error generating video",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const checkVideoStatus = async (videoId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('check-video-status', {
        body: { videoId }
      });

      if (error) throw error;

      await loadData();

      if (data.status === 'done') {
        toast({
          title: "Video ready!",
          description: "Your astrology video has been completed.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error checking video status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">Loading your cosmic dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif text-white mb-2">
              Welcome back, {user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-purple-200">Your cosmic journey awaits</p>
          </div>
          <Button 
            onClick={onSignOut}
            variant="outline"
            className="border-purple-400 text-purple-200 hover:bg-purple-500/20"
          >
            Sign Out
          </Button>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="mb-8 bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white">Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200">
                    Plan: {subscription.plan_name} (€{(subscription.price_amount / 100).toFixed(2)}/month)
                  </p>
                  <p className="text-purple-200">
                    Videos Remaining: {subscription.videos_remaining}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questionnaires */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Cosmic Profiles
              </CardTitle>
              <CardDescription className="text-purple-200">
                Astrology questionnaires and generated readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionnaires.map((questionnaire) => {
                const hasReading = readings.find(r => r.questionnaire_id === questionnaire.id);
                return (
                  <div key={questionnaire.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-white font-medium">
                          Born: {new Date(questionnaire.birth_date).toLocaleDateString()}
                        </p>
                        <p className="text-purple-300 text-sm">
                          {questionnaire.birth_place}
                        </p>
                      </div>
                      {!hasReading && (
                        <Button
                          onClick={() => generateReading(questionnaire.id)}
                          disabled={generating}
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                          {generating ? 'Generating...' : 'Generate Reading'}
                        </Button>
                      )}
                    </div>
                    {hasReading && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                        <p className="text-green-300 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Reading generated
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              {questionnaires.length === 0 && (
                <p className="text-purple-300 text-center py-4">
                  No cosmic profiles yet. Create your first questionnaire!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Videos */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5" />
                Your Astrology Videos
              </CardTitle>
              <CardDescription className="text-purple-200">
                AI-generated avatar videos with your readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readings.map((reading) => {
                const video = videos.find(v => v.reading_id === reading.id);
                return (
                  <div key={reading.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          Reading from {new Date(reading.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-purple-300 text-sm mt-1 line-clamp-2">
                          {reading.generated_text.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="ml-4">
                        {!video && (
                          <Button
                            onClick={() => generateVideo(reading.id)}
                            disabled={generating || !subscription || subscription.videos_remaining <= 0}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            {generating ? 'Creating...' : 'Create Video'}
                          </Button>
                        )}
                        {video && video.status === 'processing' && (
                          <Button
                            onClick={() => checkVideoStatus(video.id)}
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-300"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Check Status
                          </Button>
                        )}
                        {video && video.status === 'done' && video.video_url && (
                          <Button
                            onClick={() => window.open(video.video_url, '_blank')}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            Watch Video
                          </Button>
                        )}
                      </div>
                    </div>
                    {video && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          video.status === 'done' 
                            ? 'bg-green-500/20 text-green-300'
                            : video.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {video.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {readings.length === 0 && (
                <p className="text-purple-300 text-center py-4">
                  No readings yet. Generate your first reading to create videos!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
