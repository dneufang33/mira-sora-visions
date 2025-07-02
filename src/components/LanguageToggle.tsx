
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const toggleLanguage = () => {
    i18n.changeLanguage(isGerman ? 'en' : 'de');
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30">
      <Label htmlFor="language-toggle" className="text-sm text-purple-200">
        EN
      </Label>
      <Switch
        id="language-toggle"
        checked={isGerman}
        onCheckedChange={toggleLanguage}
      />
      <Label htmlFor="language-toggle" className="text-sm text-purple-200">
        DE
      </Label>
    </div>
  );
};

export default LanguageToggle;
