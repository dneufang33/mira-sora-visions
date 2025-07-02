
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface PDFGeneratorProps {
  reading: {
    id: string;
    generated_text: string;
    created_at: string;
  };
  disabled?: boolean;
  onExport?: () => void;
}

const PDFGenerator = ({ reading, disabled, onExport }: PDFGeneratorProps) => {
  const handleClick = () => {
    // Only trigger the payment gate check, don't generate PDF yet
    onExport?.();
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      size="sm"
      className="bg-gradient-to-r from-pink-600 to-purple-600"
    >
      <FileText className="w-4 h-4 mr-1" />
      {disabled ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
};

export default PDFGenerator;
