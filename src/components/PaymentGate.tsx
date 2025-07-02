
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Star, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentGateProps {
  onUpgrade: (tier: 'written' | 'spoken') => void;
  type: 'pdf' | 'audio';
}

const PaymentGate = ({ onUpgrade, type }: PaymentGateProps) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-purple-900/95 border-purple-500/30 text-white max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-serif">
            {type === 'pdf' ? t('payment.unlockPDF') : t('payment.unlockAudio')}
          </CardTitle>
          <CardDescription className="text-purple-200">
            {t('payment.subscribeMessage')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={() => onUpgrade('written')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 h-auto flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5" />
                <span className="font-semibold">{t('pricing.writtenReadings.title')}</span>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">€9.99/month</div>
                <div className="text-sm opacity-80">4 readings per month</div>
              </div>
            </Button>
            
            <Button
              onClick={() => onUpgrade('spoken')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 p-4 h-auto flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-5 h-5" />
                <span className="font-semibold">{t('pricing.spokenReadings.title')}</span>
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">€19.99/month</div>
                <div className="text-sm opacity-80">4 readings per month + audio</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentGate;
