
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import ZodiacWheel from "@/components/ZodiacWheel";
import PricingSection from "@/components/PricingSection";
import AuthForm from "@/components/AuthForm";
import QuestionnaireForm from "@/components/QuestionnaireForm";
import Dashboard from "@/components/Dashboard";
import LanguageToggle from "@/components/LanguageToggle";
import LoginButton from "@/components/LoginButton";

type AppState = 'loading' | 'landing' | 'questionnaire' | 'auth' | 'dashboard';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const [hasQuestionnaire, setHasQuestionnaire] = useState(false);
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);

  useEffect(() => {
    console.log('Setting up auth listeners...');
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserQuestionnaire(session.user.id);
      } else {
        setAppState('landing');
        setHasQuestionnaire(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
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
      console.log('Checking questionnaire for user:', userId);
      const { data, error } = await supabase
        .from('astrology_questionnaires')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Error checking questionnaire:', error);
        throw error;
      }

      const hasQuestionnaireData = data && data.length > 0;
      console.log('User has questionnaire:', hasQuestionnaireData);
      setHasQuestionnaire(hasQuestionnaireData);
      setAppState('dashboard');
    } catch (error) {
      console.error('Error checking questionnaire:', error);
      setAppState('dashboard');
    }
  };

  const handleAuthSuccess = () => {
    console.log('Auth success - state will be handled by auth listener');
  };

  const handleQuestionnaireComplete = async (data: any) => {
    console.log('Questionnaire completed with data:', data);
    setQuestionnaireData(data);
    
    if (user) {
      // User is already authenticated, save questionnaire and go to dashboard
      try {
        const { error } = await supabase
          .from('astrology_questionnaires')
          .insert({
            user_id: user.id,
            birth_date: data.birthDate,
            birth_time: data.birthTime,
            birth_place: data.birthPlace,
            personality_traits: data.personalityTraits,
            life_goals: data.lifeGoals,
            additional_info: data.additionalInfo
          });

        if (error) throw error;
        
        setHasQuestionnaire(true);
        setAppState('dashboard');
      } catch (error: any) {
        console.error('Error saving questionnaire:', error);
      }
    } else {
      // User not authenticated, go to auth
      setAppState('auth');
    }
  };

  const handleSignOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    setHasQuestionnaire(false);
    setQuestionnaireData(null);
    setAppState('landing');
  };

  const handleStartJourney = () => {
    console.log('Starting journey - going to questionnaire first');
    if (user) {
      if (hasQuestionnaire) {
        setAppState('dashboard');
      } else {
        setAppState('questionnaire');
      }
    } else {
      setAppState('questionnaire');
    }
  };

  const handleAuthSuccessWithQuestionnaire = async () => {
    // User just created account, save the questionnaire data if we have it
    if (questionnaireData && user) {
      try {
        const { error } = await supabase
          .from('astrology_questionnaires')
          .insert({
            user_id: user.id,
            birth_date: questionnaireData.birthDate,
            birth_time: questionnaireData.birthTime,
            birth_place: questionnaireData.birthPlace,
            personality_traits: questionnaireData.personalityTraits,
            life_goals: questionnaireData.lifeGoals,
            additional_info: questionnaireData.additionalInfo
          });

        if (error) throw error;
        
        setHasQuestionnaire(true);
        setQuestionnaireData(null);
      } catch (error: any) {
        console.error('Error saving questionnaire after auth:', error);
      }
    }
    handleAuthSuccess();
  };

  console.log('Current app state:', appState, 'User:', user?.email, 'Has questionnaire:', hasQuestionnaire);

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex justify-between items-start p-4">
        <LanguageToggle />
        {!user && appState === 'landing' && (
          <LoginButton onAuthSuccess={handleAuthSuccess} />
        )}
      </div>
      
      {appState === 'landing' && (
        <>
          <HeroSection onStartJourney={handleStartJourney} />
          <ZodiacWheel />
          <PricingSection onStartJourney={handleStartJourney} />
        </>
      )}

      {appState === 'questionnaire' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <QuestionnaireForm onComplete={handleQuestionnaireComplete} />
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

      {appState === 'auth' && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AuthForm onAuthSuccess={handleAuthSuccessWithQuestionnaire} />
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

      {appState === 'dashboard' && user && (
        <Dashboard user={user} onSignOut={handleSignOut} />
      )}
    </div>
  );
};

export default Index;
