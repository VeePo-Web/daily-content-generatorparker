import { User, Package, CreditCard, BarChart3 } from "lucide-react";

const dataTypes = [
  { icon: User, label: "Contact Info", description: "Name, email, phone" },
  { icon: Package, label: "Order History", description: "Purchases, preferences" },
  { icon: CreditCard, label: "Payment Data", description: "Securely processed" },
  { icon: BarChart3, label: "Usage Analytics", description: "Site interactions" }
];

const DataSummaryCard = () => {
  return (
    <div className="mb-12 p-6 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 print-avoid-break print-data-card print:bg-transparent print:border-foreground/20">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-6 print:text-foreground">
        WHAT WE COLLECT
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-2">
        {dataTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.label} className="text-center print:text-left print:flex print:items-start print:gap-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-stone-200 dark:bg-stone-800 mb-2 print:hidden">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{type.label}</p>
                <p className="text-xs text-muted-foreground print:text-foreground/70">{type.description}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-center print:text-left print:border-foreground/20">
        <p className="text-sm font-medium text-foreground">
          We never sell your data. Ever.
        </p>
      </div>
    </div>
  );
};

export default DataSummaryCard;
