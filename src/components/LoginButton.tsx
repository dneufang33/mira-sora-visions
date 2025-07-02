
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogIn } from 'lucide-react';
import AuthForm from './AuthForm';
import { useTranslation } from 'react-i18next';

interface LoginButtonProps {
  onAuthSuccess: () => void;
}

const LoginButton = ({ onAuthSuccess }: LoginButtonProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const handleAuthSuccess = () => {
    setOpen(false);
    onAuthSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-purple-400 text-purple-200 hover:bg-purple-500/20"
        >
          <LogIn className="w-4 h-4 mr-2" />
          {t('auth.login')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-purple-900/95 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-serif text-white">
            {t('auth.welcomeBack')}
          </DialogTitle>
        </DialogHeader>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default LoginButton;
