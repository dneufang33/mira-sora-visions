
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Zap } from "lucide-react";

const PricingSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 font-serif">
            Choose Your Cosmic Path
          </h2>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Select the level of celestial wisdom that resonates with your soul's journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Daily Plan */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-serif mb-2">Daily Cosmic Guidance</CardTitle>
              <div className="text-3xl font-bold text-purple-200 mb-2">$2.99<span className="text-lg font-normal">/month</span></div>
              <CardDescription className="text-purple-300">
                Perfect for daily spiritual alignment
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Daily personalized horoscope
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Lunar phase insights
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Planetary alignments
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Mira's daily wisdom
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium">
                Begin Daily Journey
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Plan */}
          <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30 text-white relative overflow-hidden group hover:scale-105 transition-all duration-300">
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 text-center pb-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-serif mb-2">Weekly Deep Dive</CardTitle>
              <div className="text-3xl font-bold text-purple-200 mb-2">$9.99<span className="text-lg font-normal">/month</span></div>
              <CardDescription className="text-purple-300">
                Comprehensive cosmic analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Everything in Daily plan
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Weekly detailed forecast
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Birth chart insights
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Personalized rituals
                </li>
                <li className="flex items-center text-purple-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Priority cosmic guidance
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-medium">
                Unlock Deep Wisdom
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Free trial notice */}
        <div className="text-center mt-12">
          <p className="text-purple-300 mb-4">
            ✨ Start with a free cosmic reading to experience Mira's wisdom ✨
          </p>
          <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-500/20 rounded-full">
            Get Free Reading
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
