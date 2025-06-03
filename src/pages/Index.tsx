
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Moon, Zap } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import ZodiacWheel from "@/components/ZodiacWheel";
import PricingSection from "@/components/PricingSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900">
      {/* Animated stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            <Star className="w-1 h-1 text-white/30 fill-current" />
          </div>
        ))}
      </div>

      <div className="relative z-10">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 font-serif">
                Unlock the Mysteries of Your Destiny
              </h2>
              <p className="text-purple-200 text-lg max-w-2xl mx-auto">
                Experience personalized cosmic guidance through the ancient wisdom of astrology, 
                channeled by Mira's ethereal presence.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-serif">Daily Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-purple-200 text-center">
                    Receive daily cosmic guidance tailored to your unique astrological profile and current planetary alignments.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                    <Moon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-serif">Lunar Wisdom</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-purple-200 text-center">
                    Harness the power of lunar cycles with moon phase insights and rituals to enhance your spiritual journey.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-serif">AI Oracle</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-purple-200 text-center">
                    Experience the fusion of ancient wisdom and modern AI as Mira channels cosmic energies into personalized guidance.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <ZodiacWheel />
        <PricingSection />

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-purple-500/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-purple-300 font-serif">
              "The stars align for those who seek wisdom in the cosmic dance of destiny."
            </p>
            <p className="text-purple-400 mt-4 text-sm">
              © 2024 Mira Sora Visions. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
