import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X, User } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BRAND } from "@/config/brand";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

interface FullScreenNavProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
  onFavoritesOpen: () => void;
  onAuthOpen: () => void;
}

const NAV_LINKS = [
  { label: "SHOP", href: "/category/shop" },
  { label: "LOOKBOOK", href: "/lookbook" },
  { label: "COMMUNITY", href: "/community" },
  { label: "ABOUT", href: "/about/our-story" },
  { label: "CONTACT", href: "/contact" },
];

// Editorial easing curve
const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      when: "beforeChildren" as const,
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const backgroundVariants = {
  hidden: { opacity: 0, scale: 1.02 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: editorialEase,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: 0.15,
      ease: editorialEase,
    },
  },
};

const linkVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: editorialEase,
    },
  },
};

const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.5,
    },
  },
};

const FullScreenNav = ({
  isOpen,
  onClose,
  onAuthOpen,
}: FullScreenNavProps) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const prefersReducedMotion = useReducedMotion();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Account';

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      lockScroll();
      const timer = setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 300);
      return () => { unlockScroll(); clearTimeout(timer); };
    }
  }, [isOpen]);

  // Keyboard handling (Escape + focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reduced motion variants
  const safeContainerVariants = prefersReducedMotion 
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : containerVariants;

  const safeLinkVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : linkVariants;

  const safeBackgroundVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : backgroundVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col overscroll-contain touch-none h-[100dvh]"
          variants={safeBackgroundVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            backgroundImage: `url('/nav-hero-hoodie.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Subtle scrim for text legibility on varied backgrounds */}
          <div className="absolute inset-0 bg-stone-50/5 pointer-events-none" />

          {/* Header: Logo + Close */}
          <motion.header
            className="relative z-10 flex items-center justify-between px-6 md:px-8"
            style={{
              paddingTop: 'max(env(safe-area-inset-top, 24px), 24px)',
            }}
            variants={headerVariants}
          >
            <Link 
              to="/" 
              onClick={onClose}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 rounded"
            >
              <img 
                src="/logo.png" 
                alt="Line of Judah" 
                className="h-5 w-auto brightness-0" 
              />
            </Link>

            <motion.button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 text-stone-900 hover:text-stone-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 rounded-full"
              aria-label="Close menu"
              whileHover={prefersReducedMotion ? {} : { rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} strokeWidth={1.5} />
            </motion.button>
          </motion.header>

          {/* Centered link stack */}
          <nav
            className="flex-1 flex items-center justify-center"
            role="navigation"
            aria-label="Main navigation"
          >
            <motion.ul
              className="text-center"
              variants={safeContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {NAV_LINKS.map((link, index) => (
                <motion.li key={link.label} variants={safeLinkVariants}>
                  <Link
                    ref={index === 0 ? firstLinkRef : undefined}
                    to={link.href}
                    onClick={onClose}
                    data-nav-link
                    className="block py-3 md:py-4 text-[14px] md:text-[15px] font-light uppercase tracking-[0.25em] text-stone-900 hover:text-champagne-700 transition-colors duration-300 focus:outline-none focus-visible:text-champagne-700"
                    style={{ lineHeight: '3.5' }}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </nav>

          {/* Footer: Account + Social */}
          <motion.footer
            className="relative z-10 flex items-center justify-between px-6 md:px-8"
            style={{
              paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)',
            }}
            variants={footerVariants}
          >
            {/* Account link */}
            {user ? (
              <Link
                to="/account"
                onClick={onClose}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus-visible:text-stone-900"
              >
                <User size={14} strokeWidth={1.5} />
                <span>Hi, {firstName}</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  setTimeout(onAuthOpen, 200);
                }}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus-visible:text-stone-900"
              >
                <User size={14} strokeWidth={1.5} />
                <span>Sign In</span>
              </button>
            )}

            {/* Social link */}
            <a
              href={BRAND.social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-[0.15em] text-stone-700 hover:text-stone-900 transition-colors duration-200 focus:outline-none focus-visible:text-stone-900"
            >
              {BRAND.social.instagram.handle}
            </a>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenNav;
