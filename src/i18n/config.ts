import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      hero: {
        title: "Discover Your Cosmic Path",
        subtitle: "Let Mira guide you through the stars with personalized astrology readings powered by AI",
        startJourney: "Begin Your Journey",
        learnMore: "Learn More"
      },
      pricing: {
        title: "Choose Your Cosmic Plan",
        subtitle: "Unlock the mysteries of your future with our AI-powered astrology readings",
        writtenReadings: {
          title: "Written Readings",
          price: "€9.99",
          period: "/month",
          originalPrice: "€14.99",
          discount: "33% OFF",
          description: "Perfect for deep reflection and detailed insights",
          features: [
            "4 detailed written readings per month",
            "PDF export for all readings",
            "Personalized cosmic insights",
            "Birth chart analysis",
            "Monthly horoscope updates"
          ],
          button: "Start Written Readings"
        },
        spokenReadings: {
          title: "Spoken Readings",
          price: "€19.99",
          period: "/month",
          originalPrice: "€29.99",
          discount: "33% OFF",
          popular: "MOST POPULAR",
          description: "Experience Mira's voice bringing your reading to life",
          features: [
            "4 audio readings per month",
            "All written reading features",
            "Professional AI voice narration",
            "Download audio files",
            "Priority customer support"
          ],
          button: "Start Audio Readings"
        },
        freeTrialNotice: "Start with a free reading to experience the magic of Mira",
        freeReadingButton: "Get Free Reading"
      },
      auth: {
        login: "Login",
        welcomeBack: "Welcome Back",
        signUp: "Sign Up",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        fullName: "Full Name",
        alreadyHaveAccount: "Already have an account?",
        dontHaveAccount: "Don't have an account?",
        signInHere: "Sign in here",
        signUpHere: "Sign up here"
      },
      payment: {
        unlockPDF: "Unlock PDF Export",
        unlockAudio: "Unlock Audio Reading",
        subscribeMessage: "Subscribe to access premium features and generate your cosmic insights."
      },
      dashboard: {
        welcome: "Welcome",
        cosmicJourney: "Your cosmic journey awaits",
        signOut: "Sign Out",
        cosmicProfiles: "Your Cosmic Profiles",
        cosmicProfilesDescription: "Birth chart information and questionnaire data",
        voiceReadings: "Voice & PDF Readings",
        voiceReadingsDescription: "AI-generated personalized readings with audio",
        bornOn: "Born on",
        generateReading: "Generate Reading",
        generating: "Generating...",
        readingGenerated: "Reading Generated",
        noProfiles: "No cosmic profiles yet",
        readingFrom: "Reading from",
        generateVoiceReading: "Generate Voice Reading",
        creating: "Creating...",
        processing: "Processing",
        playReading: "Play Reading",
        noReadings: "No readings available yet",
        freeAudioTitle: "Free Audio Generation Available!",
        freeAudioDescription: "Generate your personalized voice readings at no cost during our limited-time promotion."
      }
    }
  },
  de: {
    translation: {
      hero: {
        title: "Entdecke Deinen Kosmischen Pfad",
        subtitle: "Lass Mira dich durch die Sterne führen mit personalisierten Astrologie-Readings powered by AI",
        startJourney: "Beginne Deine Reise",
        learnMore: "Mehr Erfahren"
      },
      pricing: {
        title: "Wähle Deinen Kosmischen Plan",
        subtitle: "Entschlüssele die Geheimnisse deiner Zukunft mit unseren KI-gestützten Astrologie-Readings",
        writtenReadings: {
          title: "Schriftliche Readings",
          price: "€9,99",
          period: "/Monat",
          originalPrice: "€14,99",
          discount: "33% RABATT",
          description: "Perfekt für tiefe Reflexion und detaillierte Einblicke",
          features: [
            "4 detaillierte schriftliche Readings pro Monat",
            "PDF-Export für alle Readings",
            "Personalisierte kosmische Einblicke",
            "Geburtshoroskop-Analyse",
            "Monatliche Horoskop-Updates"
          ],
          button: "Schriftliche Readings Starten"
        },
        spokenReadings: {
          title: "Gesprochene Readings",
          price: "€19,99",
          period: "/Monat",
          originalPrice: "€29,99",
          discount: "33% RABATT",
          popular: "AM BELIEBTESTEN",
          description: "Erlebe Miras Stimme, die dein Reading zum Leben erweckt",
          features: [
            "4 Audio-Readings pro Monat",
            "Alle schriftlichen Reading-Features",
            "Professionelle KI-Stimmen-Narration",
            "Audio-Dateien herunterladen",
            "Prioritäts-Kundensupport"
          ],
          button: "Audio Readings Starten"
        },
        freeTrialNotice: "Beginne mit einem kostenlosen Reading, um die Magie von Mira zu erleben",
        freeReadingButton: "Kostenloses Reading Erhalten"
      },
      auth: {
        login: "Anmelden",
        welcomeBack: "Willkommen Zurück",
        signUp: "Registrieren",
        email: "E-Mail",
        password: "Passwort",
        confirmPassword: "Passwort Bestätigen",
        fullName: "Vollständiger Name",
        alreadyHaveAccount: "Bereits ein Konto?",
        dontHaveAccount: "Noch kein Konto?",
        signInHere: "Hier anmelden",
        signUpHere: "Hier registrieren"
      },
      payment: {
        unlockPDF: "PDF-Export Freischalten",
        unlockAudio: "Audio-Reading Freischalten",
        subscribeMessage: "Abonniere um auf Premium-Features zuzugreifen und deine kosmischen Einblicke zu generieren."
      },
      dashboard: {
        welcome: "Willkommen",
        cosmicJourney: "Deine kosmische Reise wartet",
        signOut: "Abmelden",
        cosmicProfiles: "Deine Kosmischen Profile",
        cosmicProfilesDescription: "Geburtshoroskop-Informationen und Fragebogen-Daten",
        voiceReadings: "Stimmen- & PDF-Readings",
        voiceReadingsDescription: "KI-generierte personalisierte Readings mit Audio",
        bornOn: "Geboren am",
        generateReading: "Reading Generieren",
        generating: "Generiere...",
        readingGenerated: "Reading Generiert",
        noProfiles: "Noch keine kosmischen Profile",
        readingFrom: "Reading vom",
        generateVoiceReading: "Stimmen-Reading Generieren",
        creating: "Erstelle...",
        processing: "Verarbeitung",
        playReading: "Reading Abspielen",
        noReadings: "Noch keine Readings verfügbar",
        freeAudioTitle: "Kostenlose Audio-Generierung Verfügbar!",
        freeAudioDescription: "Generiere deine personalisierten Stimmen-Readings kostenlos während unserer zeitlich begrenzten Aktion."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
