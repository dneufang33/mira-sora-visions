
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  readings_remaining: number;
}

export const useSubscription = (user: any) => {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    readings_remaining: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error checking subscription",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const decrementReading = async () => {
    if (subscription.readings_remaining > 0) {
      const newCount = subscription.readings_remaining - 1;
      setSubscription(prev => ({ ...prev, readings_remaining: newCount }));
      
      // Update in database
      try {
        await supabase
          .from('subscribers')
          .update({ readings_remaining: newCount })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating reading count:', error);
      }
    }
  };

  const createCheckout = async (tier: 'written' | 'spoken') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error creating checkout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    checkSubscription,
    decrementReading,
    createCheckout
  };
};
