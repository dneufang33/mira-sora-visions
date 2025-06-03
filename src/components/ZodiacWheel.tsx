
import { Card, CardContent } from "@/components/ui/card";

const ZodiacWheel = () => {
  const zodiacSigns = [
    { name: "Aries", symbol: "♈", dates: "Mar 21 - Apr 19", element: "Fire" },
    { name: "Taurus", symbol: "♉", dates: "Apr 20 - May 20", element: "Earth" },
    { name: "Gemini", symbol: "♊", dates: "May 21 - Jun 20", element: "Air" },
    { name: "Cancer", symbol: "♋", dates: "Jun 21 - Jul 22", element: "Water" },
    { name: "Leo", symbol: "♌", dates: "Jul 23 - Aug 22", element: "Fire" },
    { name: "Virgo", symbol: "♍", dates: "Aug 23 - Sep 22", element: "Earth" },
    { name: "Libra", symbol: "♎", dates: "Sep 23 - Oct 22", element: "Air" },
    { name: "Scorpio", symbol: "♏", dates: "Oct 23 - Nov 21", element: "Water" },
    { name: "Sagittarius", symbol: "♐", dates: "Nov 22 - Dec 21", element: "Fire" },
    { name: "Capricorn", symbol: "♑", dates: "Dec 22 - Jan 19", element: "Earth" },
    { name: "Aquarius", symbol: "♒", dates: "Jan 20 - Feb 18", element: "Air" },
    { name: "Pisces", symbol: "♓", dates: "Feb 19 - Mar 20", element: "Water" }
  ];

  const getElementColor = (element: string) => {
    switch (element) {
      case "Fire": return "from-red-400 to-orange-400";
      case "Earth": return "from-green-400 to-emerald-400";
      case "Air": return "from-blue-400 to-cyan-400";
      case "Water": return "from-purple-400 to-blue-400";
      default: return "from-purple-400 to-pink-400";
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4 font-serif">
            The Celestial Zodiac
          </h2>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Discover your cosmic archetype and unlock the secrets written in the stars
          </p>
        </div>

        <div className="relative">
          {/* Central mystical element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-sm border border-purple-400/30 flex items-center justify-center">
              <div className="text-2xl text-white font-serif">✨</div>
            </div>
          </div>

          {/* Zodiac signs in a circular arrangement */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {zodiacSigns.map((sign, index) => (
              <Card 
                key={sign.name}
                className="bg-white/5 backdrop-blur-sm border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-105 cursor-pointer group"
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br ${getElementColor(sign.element)} flex items-center justify-center text-white text-xl font-bold group-hover:scale-110 transition-transform duration-300`}>
                    {sign.symbol}
                  </div>
                  <h3 className="text-white font-serif font-semibold mb-1">{sign.name}</h3>
                  <p className="text-purple-300 text-xs mb-1">{sign.dates}</p>
                  <p className="text-purple-400 text-xs">{sign.element}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ZodiacWheel;
