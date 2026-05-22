import { X, User } from "lucide-react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useSavedForLater } from "@/hooks/useSavedForLater";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import CartDrawer from "@/components/cart/CartDrawer";
import NavLink from "./NavLink";
import MegaMenu from "./MegaMenu";
import SearchOverlay from "./SearchOverlay";
import MobileMenu from "./MobileMenu";
import AuthModal from "@/components/auth/AuthModal";
import AccountDropdown from "@/components/auth/AccountDropdown";
import FavoritesDrawer from "@/components/favorites/FavoritesDrawer";

const Navigation = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [offCanvasType, setOffCanvasType] = useState<'favorites' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount, openCart, addItem, items } = useCart();
  const { favoritesCount } = useFavorites();
  const { savedCount } = useSavedForLater();
  const prefersReducedMotion = useReducedMotion();

  // Open auth modal when ?auth=true is in the URL (from ProtectedAccountRoute redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'true') {
      setIsAuthModalOpen(true);
      // Clean the query param from URL without navigation
      params.delete('auth');
      const cleanUrl = params.toString() ? `${location.pathname}?${params}` : location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [location.search]);

  // After auth success, redirect to stored destination
  useEffect(() => {
    if (user) {
      const redirect = sessionStorage.getItem('authRedirect');
      if (redirect) {
        sessionStorage.removeItem('authRedirect');
        navigate(redirect);
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const imagesToPreload = [
      "/products/stay-holy-hoodie/flat-front.png",
      "/products/heavenly-crewneck/flat-lay.png",
      "/founders.png"
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const navItems = [
    {
      name: "Shop",
      href: "/category/shop",
      submenuItems: [
        { name: "Bottoms", href: "/category/bottoms", subcategories: [{ name: "Shorts", href: "/category/shorts" }, { name: "Joggers", href: "/category/joggers" }, { name: "Sweatpants", href: "/category/sweatpants" }] },
        { name: "Tees", href: "/category/tees", subcategories: [{ name: "Short Sleeve", href: "/category/short-sleeve" }, { name: "Long Sleeve", href: "/category/long-sleeve" }, { name: "Cropped", href: "/category/cropped" }] },
        { name: "Hoodies", href: "/category/hoodies", subcategories: [{ name: "Pullover Hoodies", href: "/category/pullover-hoodies" }, { name: "Zip-Up Hoodies", href: "/category/zip-up-hoodies" }, { name: "Crewnecks", href: "/category/crewnecks" }, { name: "Quarter Zips", href: "/category/quarter-zips" }, { name: "Lightweight Hoodies", href: "/category/lightweight-hoodies" }] },
        { name: "Hats", href: "/category/hats", subcategories: [{ name: "Snapbacks", href: "/category/snapbacks" }, { name: "Dad Hats", href: "/category/dad-hats" }, { name: "Beanies", href: "/category/beanies" }] },
        { name: "Accessories", href: "/category/accessories", subcategories: [{ name: "Bags", href: "/category/bags" }, { name: "Socks", href: "/category/socks" }, { name: "Stickers", href: "/category/stickers" }] }
      ],
      images: [
        { src: "/products/stay-holy-hoodie/flat-front.png", alt: "Hoodies Collection", label: "Hoodies" },
        { src: "/products/heavenly-crewneck/flat-lay.png", alt: "Tees Collection", label: "Tees" }
      ]
    },
    { name: "Lookbook", href: "/lookbook", submenuItems: [], images: [] },
    { name: "Community", href: "/community", submenuItems: [], images: [] },
    {
      name: "About",
      href: "/about/our-story",
      submenuItems: [],
      images: []
    }
  ];

  // Check if current path matches nav item
  const isActiveRoute = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const currentDropdownData = navItems.find(item => item.name === activeDropdown);

  return (
    <nav className="relative h-[var(--nav-height)] bg-nav/[0.97] backdrop-blur-[12px]">
      <div className="flex items-center justify-between h-full px-8">
        {/* Mobile hamburger */}
        <motion.button
          className="lg:hidden p-2.5 -ml-2 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative group"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
            initial={false}
          />
          <div className="w-5 h-5 relative z-10">
            <motion.span 
              className="absolute block w-5 h-px bg-current"
              animate={isMobileMenuOpen ? { rotate: 45, y: 10 } : { rotate: 0, y: 6 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
            />
            <motion.span 
              className="absolute block w-5 h-px bg-current top-2.5"
              animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
            />
            <motion.span 
              className="absolute block w-5 h-px bg-current"
              animate={isMobileMenuOpen ? { rotate: -45, y: 10 } : { rotate: 0, y: 14 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
            />
          </div>
        </motion.button>

        {/* Left navigation */}
        <div className="hidden lg:flex space-x-10">
          {navItems.map((item) => (
            <div 
              key={item.name} 
              className="relative" 
              onMouseEnter={() => setActiveDropdown(item.name)} 
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <NavLink href={item.href} isActive={isActiveRoute(item.href)}>
                {item.name}
              </NavLink>
              {/* Compact About dropdown */}
              <AnimatePresence>
                {item.name === "About" && activeDropdown === "About" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-0 w-[180px] bg-background border border-border shadow-sm rounded-sm py-4 px-5 z-50"
                  >
                    <div className="space-y-2.5">
                      {[
                        { name: "Our Story", href: "/about/our-story" },
                        { name: "Size Guide", href: "/about/size-guide" },
                        { name: "Customer Care", href: "/contact" },
                      ].map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="block text-sm font-light text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-colors duration-150"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Center logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link to="/" className="block">
            <span className="text-[0.7rem] sm:text-xs font-light tracking-[0.35em] text-foreground uppercase whitespace-nowrap">
              LINE OF JUDAH
            </span>
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center space-x-1">
          {/* Search */}
          <motion.button 
            className="p-2.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative group" 
            aria-label="Search" 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <motion.span 
              className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
              initial={false}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </motion.button>
          
          {/* Account */}
          <div className="relative hidden lg:block">
            <motion.button 
              className="p-2.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative group" 
              aria-label="Account" 
              onClick={() => user ? setIsAccountDropdownOpen(!isAccountDropdownOpen) : setIsAuthModalOpen(true)}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
                initial={false}
              />
              <User className="w-5 h-5 relative z-10" strokeWidth={1.5} />
            </motion.button>
            {user && <ErrorBoundary><AccountDropdown isOpen={isAccountDropdownOpen} onClose={() => setIsAccountDropdownOpen(false)} /></ErrorBoundary>}
          </div>
          
          {/* Favorites */}
          <motion.button 
            className="hidden lg:block p-2.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative group" 
            aria-label="Favorites" 
            onClick={() => setOffCanvasType('favorites')} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <motion.span 
              className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
              initial={false}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            <AnimatePresence>
              {favoritesCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 15 }} 
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[0.6rem] font-semibold rounded-full flex items-center justify-center pointer-events-none z-20"
                >
                  {favoritesCount > 9 ? '9+' : favoritesCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Cart */}
          <motion.button 
            className="p-2.5 text-nav-foreground hover:text-nav-hover transition-colors duration-200 relative group" 
            aria-label="Shopping bag" 
            onClick={openCart} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <motion.span 
              className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
              initial={false}
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 relative z-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <AnimatePresence mode="wait">
              {itemCount > 0 && (
                <motion.span 
                  key={`cart-badge-${itemCount}`}
                  initial={{ scale: 0, opacity: 0 }} 
                  animate={{ 
                    scale: prefersReducedMotion ? 1 : [0, 1.35, 0.95, 1],
                    opacity: 1 
                  }} 
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    scale: {
                      duration: prefersReducedMotion ? 0 : 0.3,
                      times: [0, 0.3, 0.7, 1],
                      ease: "easeOut"
                    },
                    opacity: { duration: 0.1 }
                  }} 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[30%] text-[0.5rem] font-semibold text-foreground pointer-events-none z-10"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Saved items indicator */}
            <AnimatePresence>
              {savedCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  exit={{ scale: 0 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 15 }} 
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-champagne-500 text-white text-[0.5rem] font-semibold rounded-full flex items-center justify-center pointer-events-none z-20"
                >
                  +{savedCount > 9 ? '9+' : savedCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mega Menu */}
      <MegaMenu isOpen={!!activeDropdown && !!currentDropdownData?.submenuItems.length} activeDropdown={activeDropdown} items={currentDropdownData?.submenuItems || []} images={currentDropdownData?.images || []} onMouseEnter={() => setActiveDropdown(activeDropdown)} onMouseLeave={() => setActiveDropdown(null)} />

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Slide-Out Menu */}
      <ErrorBoundary>
        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          navItems={navItems} 
          onSearchOpen={() => {
            setIsMobileMenuOpen(false);
            setIsSearchOpen(true);
          }} 
          onFavoritesOpen={() => {
            setIsMobileMenuOpen(false);
            setOffCanvasType('favorites');
          }} 
          onAuthOpen={() => {
            setIsMobileMenuOpen(false);
            setIsAuthModalOpen(true);
          }} 
        />
      </ErrorBoundary>

      {/* Cart Drawer */}
      <CartDrawer onViewFavorites={() => {
        setOffCanvasType('favorites');
      }} />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Favorites Drawer */}
      <ErrorBoundary>
        <FavoritesDrawer 
          isOpen={offCanvasType === 'favorites'} 
          onClose={() => setOffCanvasType(null)} 
          onAuthRequired={() => {
            setOffCanvasType(null);
            setIsAuthModalOpen(true);
          }}
        />
      </ErrorBoundary>
    </nav>
  );
};

export default Navigation;
