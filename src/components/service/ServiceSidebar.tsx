import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  HelpCircle, 
  Truck, 
  RotateCcw, 
  Ruler, 
  Headphones,
  FileText, 
  Shield, 
  Accessibility, 
  Mail, 
  Phone
} from "lucide-react";

const navigationGroups = [
  {
    label: "HELP CENTER",
    items: [
      { name: "FAQ", path: "/faq", icon: HelpCircle },
      { name: "Shipping", path: "/shipping", icon: Truck },
      { name: "Returns & Exchanges", path: "/returns", icon: RotateCcw },
      { name: "Size Guide", path: "/about/size-guide", icon: Ruler },
      { name: "Contact Us", path: "/contact", icon: Headphones },
    ]
  },
  {
    label: "POLICIES",
    items: [
      { name: "Terms of Service", path: "/terms-of-service", icon: FileText },
      { name: "Privacy Policy", path: "/privacy-policy", icon: Shield },
      { name: "Accessibility", path: "/accessibility", icon: Accessibility },
    ]
  }
];

const ServiceSidebar = () => {
  const location = useLocation();
  
  return (
    <nav className="sticky top-24 hidden lg:block">
      {navigationGroups.map((group, groupIndex) => (
        <div key={group.label} className={cn(groupIndex > 0 && "mt-8")}>
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-4">
            {group.label}
          </h3>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm font-light transition-colors border-l-2",
                      isActive 
                        ? "border-champagne-500 bg-champagne-500/5 text-foreground" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-stone-300"
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      
      {/* Contact Card */}
      <div className="mt-12 p-6 bg-stone-900">
        <h4 className="text-sm font-medium mb-2">Need Help?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Our tribe is here for you.
        </p>
        <div className="space-y-2">
          <a 
            href="mailto:hello@lineofjudah.com"
            className="flex items-center gap-2 text-sm text-champagne-600 hover:text-champagne-700 transition-colors"
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            Email Us
          </a>
          <a 
            href="tel:+12125550123"
            className="flex items-center gap-2 text-sm text-champagne-600 hover:text-champagne-700 transition-colors"
          >
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            +1 (212) 555-0123
          </a>
        </div>
      </div>
    </nav>
  );
};

export default ServiceSidebar;
