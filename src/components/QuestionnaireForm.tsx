
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuestionnaireFormProps {
  onComplete: () => void;
}

const QuestionnaireForm = ({ onComplete }: QuestionnaireFormProps) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    personalityTraits: '',
    lifeGoals: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('astrology_questionnaires')
        .insert({
          user_id: user.id,
          birth_date: formData.birthDate,
          birth_time: formData.birthTime || null,
          birth_place: formData.birthPlace,
          personality_traits: formData.personalityTraits || null,
          life_goals: formData.lifeGoals || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Questionnaire saved!",
        description: "Your cosmic profile has been created successfully.",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('Questionnaire submission error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-sm border-purple-500/30">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-white">
          Your Cosmic Profile
        </CardTitle>
        <CardDescription className="text-purple-200">
          Share your celestial details to receive personalized astrology insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="birthDate" className="text-purple-200">Birth Date *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="bg-white/5 border-purple-500/30 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="birthTime" className="text-purple-200">Birth Time (optional)</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleChange('birthTime', e.target.value)}
                className="bg-white/5 border-purple-500/30 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="birthPlace" className="text-purple-200">Birth Place *</Label>
            <Input
              id="birthPlace"
              type="text"
              value={formData.birthPlace}
              onChange={(e) => handleChange('birthPlace', e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              placeholder="City, Country (e.g., London, UK)"
              required
            />
          </div>

          <div>
            <Label htmlFor="personalityTraits" className="text-purple-200">
              Personality Traits (optional)
            </Label>
            <Textarea
              id="personalityTraits"
              value={formData.personalityTraits}
              onChange={(e) => handleChange('personalityTraits', e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              placeholder="Describe your personality, strengths, challenges..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="lifeGoals" className="text-purple-200">
              Life Goals & Aspirations (optional)
            </Label>
            <Textarea
              id="lifeGoals"
              value={formData.lifeGoals}
              onChange={(e) => handleChange('lifeGoals', e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              placeholder="What are you seeking guidance on? Career, relationships, personal growth..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
          >
            {loading ? 'Creating Your Profile...' : 'Create Cosmic Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuestionnaireForm;
