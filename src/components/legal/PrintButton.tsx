import { Printer } from "lucide-react";

const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="print-hide inline-flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Download as PDF"
    >
      <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
      <span>DOWNLOAD PDF</span>
    </button>
  );
};

export default PrintButton;
