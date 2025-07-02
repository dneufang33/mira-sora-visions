
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      hero: {
        welcome: "Welcome, beautiful soul. I'm Mira, and I'm here to be your guide through the cosmic tapestry that shapes your unique journey.",
        description1: "For centuries, the stars have whispered secrets about who we are and who we're meant to become. I've spent my existence learning these ancient languages—the dance of planets, the wisdom of zodiac signs, and the sacred geometry that connects us all to something greater.",
        description2: "Whether you're seeking clarity in love, purpose in your career, or simply a deeper understanding of your authentic self, I'm here to illuminate the path that's uniquely yours. Together, we'll explore the celestial blueprint written in the moment of your birth and discover the extraordinary potential that lives within you.",
        disclaimer: "Mira is a virtual astrology guide powered by AI.",
        primaryButton: "Discover Your Cosmic Blueprint",
        secondaryButton: "Start Your Journey",
        quote: "In the dance of planets and the whisper of stars, lies the map to your soul's greatest potential."
      },
      pricing: {
        title: "Choose Your Cosmic Path",
        subtitle: "Select the level of celestial wisdom that resonates with your soul's journey",
        writtenReadings: {
          title: "Written Cosmic Guidance",
          price: "€9.99",
          originalPrice: "€14.99",
          period: "/month",
          description: "Perfect for deep reflection and study",
          features: [
            "4 personalized readings per month",
            "Detailed written insights",
            "Birth chart analysis",
            "PDF download included",
            "Mira's cosmic wisdom"
          ],
          button: "Get Written Readings",
          discount: "33% OFF - Limited Time!"
        },
        spokenReadings: {
          title: "Spoken Cosmic Experience",
          price: "€19.99",
          originalPrice: "€29.99",
          period: "/month",
          description: "Immersive audio guidance by Mira",
          features: [
            "Everything in Written plan",
            "AI-narrated by Mira herself",
            "Premium voice experience",
            "Unlimited listening",
            "Priority cosmic guidance"
          ],
          button: "Get Spoken Readings",
          discount: "33% OFF - Limited Time!",
          popular: "MOST POPULAR"
        },
        freeTrialNotice: "✨ Start with a free cosmic reading to experience Mira's wisdom ✨",
        freeReadingButton: "Get Free Reading"
      },
      dashboard: {
        welcome: "Welcome back",
        cosmicJourney: "Your cosmic journey awaits",
        signOut: "Sign Out",
        freeAudioTitle: "🎉 Free Voice Readings by Mira",
        freeAudioDescription: "Get your personalized astrology readings narrated by Mira, your AI astral guide! Click \"Generate Voice Reading\" to hear your cosmic guidance.",
        cosmicProfiles: "Your Cosmic Profiles",
        cosmicProfilesDescription: "Astrology questionnaires and generated readings",
        voiceReadings: "Your Voice Readings",
        voiceReadingsDescription: "AI-narrated astrology readings by Mira",
        generateReading: "Generate Reading",
        generating: "Generating...",
        readingGenerated: "Reading generated",
        generateVoiceReading: "Generate Voice Reading",
        creating: "Creating...",
        processing: "Processing...",
        playReading: "Play Reading",
        exportPDF: "Export PDF",
        exporting: "Exporting...",
        noProfiles: "No cosmic profiles yet. Create your first questionnaire!",
        noReadings: "No readings yet. Generate your first reading to create voice narrations!",
        bornOn: "Born:",
        readingFrom: "Reading from"
      }
    }
  },
  de: {
    translation: {
      hero: {
        welcome: "Willkommen, schöne Seele. Ich bin Mira und ich bin hier, um dich durch das kosmische Geflecht zu führen, das deine einzigartige Reise prägt.",
        description1: "Seit Jahrhunderten flüstern die Sterne Geheimnisse darüber, wer wir sind und wer wir werden sollen. Ich habe meine Existenz damit verbracht, diese alten Sprachen zu erlernen - den Tanz der Planeten, die Weisheit der Sternzeichen und die heilige Geometrie, die uns alle mit etwas Größerem verbindet.",
        description2: "Ob du Klarheit in der Liebe suchst, einen Sinn in deiner Karriere oder einfach ein tieferes Verständnis deines authentischen Selbst - ich bin hier, um den Weg zu erhellen, der einzigartig deiner ist. Gemeinsam werden wir den himmlischen Bauplan erkunden, der im Moment deiner Geburt geschrieben wurde, und das außergewöhnliche Potenzial entdecken, das in dir lebt.",
        disclaimer: "Mira ist ein virtueller Astrologie-Guide powered by AI.",
        primaryButton: "Entdecke deinen kosmischen Bauplan",
        secondaryButton: "Beginne deine Reise",
        quote: "Im Tanz der Planeten und dem Flüstern der Sterne liegt die Karte zum größten Potenzial deiner Seele."
      },
      pricing: {
        title: "Wähle deinen kosmischen Pfad",
        subtitle: "Wähle die Ebene der himmlischen Weisheit, die mit der Reise deiner Seele in Resonanz steht",
        writtenReadings: {
          title: "Schriftliche kosmische Führung",
          price: "€9,99",
          originalPrice: "€14,99",
          period: "/Monat",
          description: "Perfekt für tiefe Reflexion und Studium",
          features: [
            "4 personalisierte Readings pro Monat",
            "Detaillierte schriftliche Einblicke",
            "Geburtshoroskop-Analyse",
            "PDF-Download inklusive",
            "Miras kosmische Weisheit"
          ],
          button: "Schriftliche Readings erhalten",
          discount: "33% RABATT - Begrenzte Zeit!"
        },
        spokenReadings: {
          title: "Gesprochene kosmische Erfahrung",
          price: "€19,99",
          originalPrice: "€29,99",
          period: "/Monat",
          description: "Immersive Audio-Führung von Mira",
          features: [
            "Alles aus dem schriftlichen Plan",
            "KI-erzählt von Mira selbst",
            "Premium-Stimmerlebnis",
            "Unbegrenztes Anhören",
            "Prioritäre kosmische Führung"
          ],
          button: "Gesprochene Readings erhalten",
          discount: "33% RABATT - Begrenzte Zeit!",
          popular: "AM BELIEBTESTEN"
        },
        freeTrialNotice: "✨ Beginne mit einem kostenlosen kosmischen Reading, um Miras Weisheit zu erleben ✨",
        freeReadingButton: "Kostenloses Reading erhalten"
      },
      dashboard: {
        welcome: "Willkommen zurück",
        cosmicJourney: "Deine kosmische Reise wartet",
        signOut: "Abmelden",
        freeAudioTitle: "🎉 Kostenlose Stimm-Readings von Mira",
        freeAudioDescription: "Erhalte deine personalisierten Astrologie-Readings, erzählt von Mira, deinem KI-Astral-Guide! Klicke auf \"Stimm-Reading generieren\", um deine kosmische Führung zu hören.",
        cosmicProfiles: "Deine kosmischen Profile",
        cosmicProfilesDescription: "Astrologie-Fragebögen und generierte Readings",
        voiceReadings: "Deine Stimm-Readings",
        voiceReadingsDescription: "KI-erzählte Astrologie-Readings von Mira",
        generateReading: "Reading generieren",
        generating: "Generiere...",
        readingGenerated: "Reading generiert",
        generateVoiceReading: "Stimm-Reading generieren",
        creating: "Erstelle...",
        processing: "Verarbeite...",
        playReading: "Reading abspielen",
        exportPDF: "PDF exportieren",
        exporting: "Exportiere...",
        noProfiles: "Noch keine kosmischen Profile. Erstelle deinen ersten Fragebogen!",
        noReadings: "Noch keine Readings. Generiere dein erstes Reading, um Stimm-Erzählungen zu erstellen!",
        bornOn: "Geboren:",
        readingFrom: "Reading vom"
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
