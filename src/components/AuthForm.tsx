
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onAuthSuccess: () => void;
}

const AuthForm = ({ onAuthSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Auth attempt:', isLogin ? 'login' : 'signup', email);
      console.log('Supabase URL:', 'https://khqhuzmkmoymwrpfnrth.supabase.co');
      
      if (isLogin) {
        console.log('Attempting login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log('Login response:', { data, error });
        if (error) throw error;
        console.log('Login successful');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else {
        console.log('Attempting signup...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        console.log('Signup response:', { data, error });
        if (error) throw error;
        console.log('Signup successful');
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });
      }
      onAuthSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        cause: error.cause,
        stack: error.stack
      });
      
      let errorMessage = error.message;
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        errorMessage = 'Network connection error. Please check your internet connection and try again.';
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    console.log('Toggling auth mode from', isLogin ? 'login' : 'signup', 'to', !isLogin ? 'login' : 'signup');
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border-purple-500/30">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-white">
          {isLogin ? 'Welcome Back' : 'Join Mira'}
        </CardTitle>
        <CardDescription className="text-purple-200">
          {isLogin ? 'Sign in to access your cosmic readings' : 'Create your account to begin your astral journey'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="fullName" className="text-purple-200">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
                placeholder="Enter your full name"
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="text-purple-200">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-purple-200">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-purple-300 hover:text-purple-200 underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
