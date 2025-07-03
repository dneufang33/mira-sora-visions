import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Volume2, Clock, CheckCircle, Play, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PDFGenerator from './PDFGenerator';
import PaymentGate from './PaymentGate';
import CosmicProducts from './CosmicProducts';
import SubscriptionManager from './SubscriptionManager';
import { useSubscription } from '@/hooks/useSubscription';
import jsPDF from 'jspdf';

interface DashboardProps {
  user: any;
  onSignOut: () => void;
}

const Dashboard = ({ user, onSignOut }: DashboardProps) => {
  const { t } = useTranslation();
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [audioReadings, setAudioReadings] = useState<any[]>([]);
  const [cosmicReports, setCosmicReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exportingPDF, setExportingPDF] = useState<string | null>(null);
  const [showPaymentGate, setShowPaymentGate] = useState<{ show: boolean; type: 'pdf' | 'audio' }>({ show: false, type: 'pdf' });
  const { toast } = useToast();
  
  const { subscription, loading: subLoading, checkSubscription, decrementReading, createCheckout } = useSubscription(user);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionnairesRes, readingsRes, audioRes, cosmicRes] = await Promise.all([
        supabase.from('astrology_questionnaires').select('*').order('created_at', { ascending: false }),
        supabase.from('readings').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('audio_readings').select('*').order('created_at', { ascending: false }),
        (supabase as any).from('cosmic_reports').select('*').order('created_at', { ascending: false }),
      ]);

      if (questionnairesRes.error) throw questionnairesRes.error;
      if (readingsRes.error) throw readingsRes.error;
      if (audioRes.error) throw audioRes.error;

      setQuestionnaires(questionnairesRes.data || []);
      setReadings(readingsRes.data || []);
      setAudioReadings(audioRes.data || []);
      setCosmicReports(cosmicRes.data || []);
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
    if (!subscription.subscribed || subscription.readings_remaining <= 0) {
      setShowPaymentGate({ show: true, type: 'audio' });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { readingId }
      });

      if (error) throw error;

      await decrementReading();
      toast({
        title: "Audio generation started!",
        description: "Your voice reading is being created by Mira.",
      });

      await loadData();
      await checkSubscription();
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

  const handlePDFExport = async (readingId: string) => {
    if (!subscription.subscribed || subscription.readings_remaining <= 0) {
      setShowPaymentGate({ show: true, type: 'pdf' });
      return;
    }

    const reading = readings.find(r => r.id === readingId);
    if (!reading) return;

    setExportingPDF(readingId);
    
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      const primaryColor = [139, 69, 193] as const;
      const textColor = [51, 51, 51] as const;
      const accentColor = [236, 72, 153] as const;
      
      pdf.setFillColor(139, 69, 193);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Mira', margin, 25);
      
      pdf.setFontSize(12);
      pdf.text('Your AI Astral Guide', margin, 35);
      
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(18);
      const readingDate = new Date(reading.created_at).toLocaleDateString();
      pdf.text(`Cosmic Reading - ${readingDate}`, margin, 60);
      
      pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.setLineWidth(2);
      pdf.line(margin, 70, pageWidth - margin, 70);
      
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      pdf.setFontSize(11);
      
      const lines = pdf.splitTextToSize(reading.generated_text, maxWidth);
      let yPosition = 85;
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });
      
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(139, 69, 193);
      pdf.text('Generated by Mira AI - Your Personal Astrology Guide', margin, footerY);
      
      pdf.save(`mira-cosmic-reading-${readingDate}.pdf`);

      await decrementReading();
      await checkSubscription();
      
      toast({
        title: "PDF exported successfully!",
        description: "Your cosmic reading has been downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error exporting PDF",
        description: "Could not generate the PDF file",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(null);
    }
  };

  const handleUpgrade = (tier: 'written' | 'spoken') => {
    setShowPaymentGate({ show: false, type: 'pdf' });
    createCheckout(tier);
  };

  if (loading || subLoading) {
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
              {t('dashboard.welcome')}, {user.user_metadata?.full_name || user.email}
            </h1>
            <p className="text-purple-200">{t('dashboard.cosmicJourney')}</p>
          </div>
          <Button 
            onClick={onSignOut}
            variant="outline"
            className="border-purple-400 text-purple-200 hover:bg-purple-500/20"
          >
            {t('dashboard.signOut')}
          </Button>
        </div>

        {/* Subscription Status */}
        <Card className="mb-8 bg-white/10 backdrop-blur-sm border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription.subscribed ? (
              <div className="space-y-2">
                <p className="text-green-300">
                  ✓ Active {subscription.subscription_tier} subscription
                </p>
                <p className="text-purple-200">
                  Readings remaining this month: {subscription.readings_remaining}
                </p>
                {subscription.subscription_end && (
                  <p className="text-purple-300 text-sm">
                    Renews on: {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-yellow-300">No active subscription</p>
                <p className="text-purple-200 text-sm">
                  Subscribe to unlock PDF exports and audio readings
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Manager */}
        <div className="mb-8">
          <SubscriptionManager 
            subscription={subscription} 
            onCancel={() => checkSubscription()} 
          />
        </div>

        {/* New Cosmic Products Section */}
        <div className="mb-12">
          <CosmicProducts user={user} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questionnaires */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('dashboard.cosmicProfiles')}
              </CardTitle>
              <CardDescription className="text-purple-200">
                {t('dashboard.cosmicProfilesDescription')}
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
                          {t('dashboard.bornOn')} {new Date(questionnaire.birth_date).toLocaleDateString()}
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
                          {generating ? t('dashboard.generating') : t('dashboard.generateReading')}
                        </Button>
                      )}
                    </div>
                    {hasReading && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                        <p className="text-green-300 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          {t('dashboard.readingGenerated')}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
              {questionnaires.length === 0 && (
                <p className="text-purple-300 text-center py-4">
                  {t('dashboard.noProfiles')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Audio Readings */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                {t('dashboard.voiceReadings')}
              </CardTitle>
              <CardDescription className="text-purple-200">
                {t('dashboard.voiceReadingsDescription')}
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
                          {t('dashboard.readingFrom')} {new Date(reading.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-purple-300 text-sm mt-1 line-clamp-2">
                          {reading.generated_text.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        <PDFGenerator
                          reading={reading}
                          disabled={exportingPDF === reading.id}
                          onExport={() => handlePDFExport(reading.id)}
                        />
                        {!audio && (
                          <Button
                            onClick={() => generateAudio(reading.id)}
                            disabled={generating}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600"
                          >
                            {generating ? t('dashboard.creating') : t('dashboard.generateVoiceReading')}
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
                            {t('dashboard.processing')}
                          </Button>
                        )}
                        {audio && audio.status === 'completed' && audio.audio_url && (
                          <Button
                            onClick={() => playAudio(audio.audio_url)}
                            size="sm"
                            className="bg-gradient-to-r from-green-600 to-blue-600"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            {t('dashboard.playReading')}
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
                  {t('dashboard.noReadings')}
                </p>
                )}
            </CardContent>
          </Card>
        </div>

        {showPaymentGate.show && (
          <PaymentGate
            type={showPaymentGate.type}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
