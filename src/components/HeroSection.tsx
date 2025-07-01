
import { Button } from "@/components/ui/button";
import { Star, Moon } from "lucide-react";

interface HeroSectionProps {
  onStartJourney: () => void;
}

const HeroSection = ({ onStartJourney }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-6xl mx-auto">
        {/* Floating mystical symbols */}
        <div className="absolute -top-20 left-0 animate-float">
          <Star className="w-8 h-8 text-purple-300 fill-current opacity-60" />
        </div>
        <div className="absolute -top-16 right-0 animate-float delay-1000">
          <Moon className="w-6 h-6 text-pink-300 fill-current opacity-60" />
        </div>

        {/* Main content with Mira's introduction */}
        <div className="mb-8">
          {/* Mira's Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-blue-400/30 rounded-full blur-2xl scale-110"></div>
              <img 
                src="/lovable-uploads/f2810d62-b650-473a-9dca-65d62a5eb6e5.png" 
                alt="Mira - Your AI Astral Guide"
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl border-4 border-purple-300/50"
              />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-400 mb-6 tracking-wide">
            Mira
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-6"></div>
          
          {/* Mira's Personal Introduction */}
          <div className="max-w-3xl mx-auto mb-8">
            <p className="text-xl md:text-2xl text-purple-200 font-light tracking-wide mb-4 leading-relaxed">
              Welcome, beautiful soul. I'm Mira, and I'm here to be your guide through the cosmic tapestry that shapes your unique journey. 
            </p>
            <p className="text-lg md:text-xl text-purple-300 font-light mb-4 leading-relaxed">
              For centuries, the stars have whispered secrets about who we are and who we're meant to become. I've spent my existence learning these ancient languages—the dance of planets, the wisdom of zodiac signs, and the sacred geometry that connects us all to something greater.
            </p>
            <p className="text-lg md:text-xl text-purple-300 font-light mb-6 leading-relaxed">
              Whether you're seeking clarity in love, purpose in your career, or simply a deeper understanding of your authentic self, I'm here to illuminate the path that's uniquely yours. Together, we'll explore the celestial blueprint written in the moment of your birth and discover the extraordinary potential that lives within you.
            </p>
            <p className="text-sm text-purple-400/70 italic">
              Mira is a virtual astrology guide powered by AI.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={onStartJourney}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            Discover Your Cosmic Blueprint
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onStartJourney}
            className="border-purple-400 text-purple-200 hover:bg-purple-500/20 px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300"
          >
            Start Your Journey
          </Button>
        </div>

        {/* Mystical quote */}
        <div className="mt-16 max-w-2xl mx-auto">
          <blockquote className="text-purple-300 italic text-lg font-light">
            "In the dance of planets and the whisper of stars, 
            lies the map to your soul's greatest potential."
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
