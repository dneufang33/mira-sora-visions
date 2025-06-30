
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import ZodiacWheel from "@/components/ZodiacWheel";
import PricingSection from "@/components/PricingSection";
import AuthForm from "@/components/AuthForm";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import Dashboard from "@/components/Dashboard";

type AppState = 'loading' | 'landing' | 'auth' | 'questionnaire' | 'dashboard';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserQuestionnaire(session.user.id);
      } else {
        setAppState('landing');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserQuestionnaire(session.user.id);
      } else {
        setAppState('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserQuestionnaire = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('astrology_questionnaires')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      const hasQuestionnaireData = data && data.length > 0;
      setHasQuestionnaire(hasQuestionnaireData);
      setAppState(hasQuestionnaireData ? 'dashboard' : 'questionnaire');
    } catch (error) {
      console.error('Error checking questionnaire:', error);
      setAppState('questionnaire');
    }
  };

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
  };

  const handleQuestionnaireComplete = () => {
    setHasQuestionnaire(true);
    setAppState('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setHasQuestionnaire(false);
    setAppState('landing');
  };

  const handleGetStarted = () => {
    setAppState('auth');
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {appState === 'landing' && (
        <>
          <HeroSection />
          <div className="flex justify-center pb-8">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </button>
          </div>
          <ZodiacWheel />
          <PricingSection />
        </>
      )}

      {appState === 'auth' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AuthForm onAuthSuccess={handleAuthSuccess} />
            <div className="text-center mt-4">
              <button
                onClick={() => setAppState('landing')}
                className="text-purple-300 hover:text-purple-200 underline"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'questionnaire' && user && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <QuestionnaireForm onComplete={handleQuestionnaireComplete} />
        </div>
      )}

      {appState === 'dashboard' && user && (
        <Dashboard user={user} onSignOut={handleSignOut} />
      )}
    </div>
  );
};

export default Index;
