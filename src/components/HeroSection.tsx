
import { Button } from "@/components/ui/button";
import { Star, Moon } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Floating mystical symbols */}
        <div className="absolute -top-20 left-0 animate-float">
          <Star className="w-8 h-8 text-purple-300 fill-current opacity-60" />
        </div>
        <div className="absolute -top-16 right-0 animate-float delay-1000">
          <Moon className="w-6 h-6 text-pink-300 fill-current opacity-60" />
        </div>

        {/* Main content */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-purple-200 to-purple-400 mb-6 tracking-wide">
            Mira
          </h1>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto mb-6"></div>
          <p className="text-xl md:text-2xl text-purple-200 font-light tracking-wide mb-2">
            Your AI Astral Guide
          </p>
          <p className="text-purple-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the cosmic forces that shape your destiny through personalized astrological insights, 
            channeled by an AI oracle attuned to the celestial rhythms.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            Begin Your Journey
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-purple-400 text-purple-200 hover:bg-purple-500/20 px-8 py-3 rounded-full font-medium tracking-wide transition-all duration-300"
          >
            Explore Free Reading
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
