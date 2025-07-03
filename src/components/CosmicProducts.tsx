
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Heart, Calendar, Users, Star, Sparkles } from 'lucide-react';

interface CosmicProductsProps {
  user: any;
}

const products = [
  {
    id: 'natal-chart',
    title: '🔮 Personalized Natal Chart Reading',
    description: 'Explore the celestial blueprint of your birth. A beautifully designed PDF packed with deep insights into your personality, career path, and love life — written in the stars the moment you were born.',
    price: '€9.99',
    icon: Star,
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'lunar-cycle',
    title: '🌕 Lunar Cycle & Moon Ritual Guide',
    description: 'Harness the power of the moon to manifest, reflect, and heal. A monthly PDF + audio bundle that shows how each phase uniquely affects you.',
    price: '€7.77',
    icon: Calendar,
    color: 'from-blue-600 to-purple-600',
    badge: 'Sacred'
  },
  {
    id: 'synastry-compatibility',
    title: '💞 Synastry & Compatibility Report',
    description: 'Want to know what\'s really written between you and someone special? Find out if you\'re astrologically aligned — and where you\'ll shine or clash.',
    price: '€12.22',
    icon: Heart,
    color: 'from-pink-600 to-red-600'
  },
  {
    id: 'transit-forecast',
    title: '🪐 2025 Year-Ahead Transit Forecast',
    description: 'A tailored roadmap of planetary shifts that will affect your year. Think opportunities, challenges, and hidden blessings — month by month.',
    price: '€14.44',
    icon: Users,
    color: 'from-indigo-600 to-purple-600'
  }
];

const CosmicProducts = ({ user }: CosmicProductsProps) => {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (productId: string) => {
    setPurchasing(productId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-one-time-payment', {
        body: { productId }
      });

      if (error) throw error;

      // Open payment in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to payment",
        description: "Opening secure checkout in a new tab...",
      });
    } catch (error: any) {
      toast({
        title: "Error creating payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleBundlePurchase = async () => {
    setPurchasing('bundle');
    
    try {
      const { data, error } = await supabase.functions.invoke('create-one-time-payment', {
        body: { productId: 'celestial-collection' }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
      
      toast({
        title: "Redirecting to payment",
        description: "Opening secure checkout for the complete collection...",
      });
    } catch (error: any) {
      toast({
        title: "Error creating payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-serif text-white mb-4">
          🌟 Unlock the Universe, One Star at a Time 🌟
        </h2>
        <p className="text-xl text-purple-200 mb-2">
          You've heard your stars whisper — now let them sing.
        </p>
        <p className="text-purple-300 max-w-4xl mx-auto">
          Alongside our beloved Voice Reading and PDF Horoscope, we're thrilled to unveil a constellation of new cosmic treasures — crafted for the curious, the soulful, and the starry-eyed.
        </p>
      </div>

      {/* New Products Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-serif text-white text-center">
          ✨ New One-Time Purchase Products — Just for You ✨
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => {
            const IconComponent = product.icon;
            return (
              <Card key={product.id} className="bg-white/10 backdrop-blur-sm border-purple-500/30 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${product.color} opacity-20 rounded-full -translate-y-16 translate-x-16`}></div>
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-6 h-6 text-purple-300" />
                      {product.badge && (
                        <Badge variant="secondary" className="bg-purple-500/20 text-purple-200">
                          {product.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {product.price}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-purple-200 leading-relaxed">
                    {product.description}
                  </CardDescription>
                  
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <FileText className="w-4 h-4" />
                    <span>High-quality PDF Export</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-purple-300">
                    <Download className="w-4 h-4" />
                    <span>Instant download after purchase</span>
                  </div>
                  
                  <Button
                    onClick={() => handlePurchase(product.id)}
                    disabled={purchasing === product.id}
                    className={`w-full bg-gradient-to-r ${product.color} hover:opacity-90 transition-opacity`}
                  >
                    {purchasing === product.id ? 'Processing...' : `Get ${product.title.split(' ')[0]} Reading`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bundle Section */}
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border-purple-400/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
        <CardHeader className="relative text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <CardTitle className="text-2xl text-white">💫 Bundle Your Destiny 💫</CardTitle>
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <CardDescription className="text-purple-200 text-lg">
            Want it all? Choose our "Celestial Collection" – all 4 reports for just €29.99
          </CardDescription>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mx-auto mt-2">
            Save over 30%!
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-white">€29.99</div>
            <div className="text-purple-300 line-through">€43.42</div>
          </div>
          
          <Button
            onClick={handleBundlePurchase}
            disabled={purchasing === 'bundle'}
            size="lg"
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold"
          >
            {purchasing === 'bundle' ? 'Processing...' : 'Get Complete Celestial Collection'}
          </Button>
          
          <div className="text-center text-sm text-purple-300">
            ✨ Magic you can keep, gift, or print ✨
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CosmicProducts;
