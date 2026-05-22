import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ServiceHero from "./ServiceHero";
import ServiceSidebar from "./ServiceSidebar";

interface ServicePageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  lastUpdated?: string;
  heroValueProps?: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  showSidebar?: boolean;
  heroAlignment?: 'left' | 'center';
  showNewsletter?: boolean;
}

const ServicePageLayout = ({
  children,
  title,
  subtitle,
  eyebrow,
  lastUpdated,
  heroValueProps,
  showSearch = false,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  showSidebar = true,
  heroAlignment = 'left',
  showNewsletter = true
}: ServicePageLayoutProps) => {
  return (
    <Layout showNewsletter={showNewsletter}>
      <ServiceHero
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        lastUpdated={lastUpdated}
        alignment={heroAlignment}
        valueProps={heroValueProps}
        showSearch={showSearch}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-16 pb-safe">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <ServiceSidebar />
            </aside>
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        )}
      </main>
    </Layout>
  );
};

export default ServicePageLayout;
