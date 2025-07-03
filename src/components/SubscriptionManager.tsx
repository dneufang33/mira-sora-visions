
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, AlertTriangle } from 'lucide-react';

interface SubscriptionManagerProps {
  subscription: any;
  onCancel: () => void;
}

const SubscriptionManager = ({ subscription, onCancel }: SubscriptionManagerProps) => {
  const [canceling, setCanceling] = useState(false);
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    setCanceling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      // Open Stripe Customer Portal in new tab where user can manage subscription
      window.open(data.url, '_blank');
      
      toast({
        title: "Opening subscription management",
        description: "You can cancel your subscription in the customer portal that just opened.",
      });
      
      // Notify about cancellation (you can implement webhook or polling to track this)
      console.log("User accessed cancellation portal for subscription:", subscription.subscription_tier);
      
    } catch (error: any) {
      toast({
        title: "Error accessing subscription management",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  if (!subscription.subscribed) {
    return null;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Subscription Management
        </CardTitle>
        <CardDescription className="text-purple-200">
          Manage your monthly subscription - cancel anytime with no commitment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-300 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-medium">Cancel Anytime</p>
              <p className="text-yellow-300 text-sm">
                Your subscription can be cancelled at any time. No long-term commitment required.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-white">
            <strong>Current Plan:</strong> {subscription.subscription_tier} subscription
          </p>
          <p className="text-purple-200">
            <strong>Readings Remaining:</strong> {subscription.readings_remaining} this month
          </p>
          {subscription.subscription_end && (
            <p className="text-purple-300 text-sm">
              <strong>Next Billing:</strong> {new Date(subscription.subscription_end).toLocaleDateString()}
            </p>
          )}
        </div>

        <Button
          onClick={handleCancelSubscription}
          disabled={canceling}
          variant="outline"
          className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10"
        >
          {canceling ? 'Opening Portal...' : 'Manage Subscription & Cancel'}
        </Button>
        
        <p className="text-xs text-purple-400 text-center">
          You'll be redirected to Stripe's secure portal to manage your subscription
        </p>
      </CardContent>
    </Card>
  );
};

export default SubscriptionManager;
