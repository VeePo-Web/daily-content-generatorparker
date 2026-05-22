import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import EmailOptIn from "@/components/homepage/EmailOptIn";
import WelcomeBackBanner from "@/components/customer/WelcomeBackBanner";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  showNewsletter?: boolean;
  showWelcomeBanner?: boolean;
  immersiveHero?: boolean;
  className?: string;
}

/**
 * Main layout wrapper that handles header offset and consistent page structure.
 * Use this component for all pages to ensure content isn't hidden behind the fixed header.
 */
const Layout = ({ 
  children, 
  showFooter = true, 
  showNewsletter = true,
  showWelcomeBanner = true,
  immersiveHero = false,
  className = "" 
}: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Skip to main content - Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
      >
        Skip to main content
      </a>
      
      <Header />
      
      {/* Main content with header offset */}
      <main id="main-content" className={immersiveHero ? "scroll-mt-[var(--header-height)]" : "pt-[var(--header-height)] scroll-mt-[var(--header-height)]"}>
        {/* Return customer greeting */}
        {showWelcomeBanner && <WelcomeBackBanner />}
        
        {children}
      </main>
      
      {showNewsletter && <EmailOptIn />}
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
