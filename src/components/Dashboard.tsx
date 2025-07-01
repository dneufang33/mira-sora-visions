
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Volume2, Clock, CheckCircle, Play } from 'lucide-react';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

const Dashboard = ({ user, onSignOut }: DashboardProps) => {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [audioReadings, setAudioReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionnairesRes, readingsRes, audioRes] = await Promise.all([
        supabase.from('astrology_questionnaires').select('*').order('created_at', { ascending: false }),
        supabase.from('readings').select('*').order('created_at', { ascending: false }),
        supabase.from('audio_readings').select('*').order('created_at', { ascending: false }),
      ]);

      if (questionnairesRes.error) throw questionnairesRes.error;
      if (readingsRes.error) throw readingsRes.error;
      if (audioRes.error) throw audioRes.error;

      setQuestionnaires(questionnairesRes.data || []);
      setReadings(readingsRes.data || []);
      setAudioReadings(audioRes.data || []);
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

  const generateAudio = async (readingId: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { readingId }
      });

      if (error) throw error;

      toast({
        title: "Audio generation started!",
        description: "Your voice reading is being created by Mira.",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error generating audio",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      toast({
        title: "Error playing audio",
        description: "Could not play the audio file",
        variant: "destructive",
      });
    });
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

        {/* Free Audio Generation Notice */}
        <Card className="mb-8 bg-green-500/10 backdrop-blur-sm border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-300">🎉 Free Voice Readings by Mira</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-200">
              Get your personalized astrology readings narrated by Mira, your AI astral guide! Click "Generate Voice Reading" to hear your cosmic guidance.
            </p>
          </CardContent>
        </Card>

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

          {/* Audio Readings */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Your Voice Readings
              </CardTitle>
              <CardDescription className="text-purple-200">
                AI-narrated astrology readings by Mira
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readings.map((reading) => {
                const audio = audioReadings.find(a => a.reading_id === reading.id);
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
                        {!audio && (
                          <Button
                            onClick={() => generateAudio(reading.id)}
                            disabled={generating}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            {generating ? 'Creating...' : 'Generate Voice Reading'}
                          </Button>
                        )}
                        {audio && audio.status === 'processing' && (
                          <Button
                            disabled
                            size="sm"
                            variant="outline"
                            className="border-yellow-500 text-yellow-300"
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Processing...
                          </Button>
                        )}
                        {audio && audio.status === 'completed' && audio.audio_url && (
                          <Button
                            onClick={() => playAudio(audio.audio_url)}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Play Reading
                          </Button>
                        )}
                      </div>
                    </div>
                    {audio && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          audio.status === 'completed' 
                            ? 'bg-green-500/20 text-green-300'
                            : audio.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {audio.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              {readings.length === 0 && (
                <p className="text-purple-300 text-center py-4">
                  No readings yet. Generate your first reading to create voice narrations!
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
