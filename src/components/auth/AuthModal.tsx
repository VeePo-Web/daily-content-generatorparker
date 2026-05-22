import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SignInForm from './SignInForm';
import CreateAccountForm from './CreateAccountForm';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;
const exitEase = [0.4, 0, 1, 1] as const;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const panelVariants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.35,
      ease: editorialEase,
    },
  },
  exit: {
    x: '100%',
    transition: {
      type: 'tween' as const,
      duration: 0.3,
      ease: exitEase,
    },
  },
};

export default function AuthModal({ isOpen, onClose, defaultTab = 'signup' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);

  // Scroll lock + Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      unlockScroll();
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSuccess = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 touch-none"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-[100dvh] w-full max-w-md bg-background z-50 flex flex-col shadow-2xl overscroll-contain"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-light tracking-wide text-foreground">
                {activeTab === 'signin' ? 'Welcome Back' : 'Join Line of Judah'}
              </h2>
              <motion.button
                className="p-2 text-foreground hover:text-muted-foreground transition-colors relative group"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Close"
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
                  initial={false}
                />
                <X size={20} strokeWidth={1.5} className="relative z-10" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-4 text-sm tracking-wide transition-colors relative ${
                  activeTab === 'signup'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Create Account
                {activeTab === 'signup' && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-4 text-sm tracking-wide transition-colors relative ${
                  activeTab === 'signin'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
                {activeTab === 'signin' && (
                  <motion.div
                    layoutId="auth-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <AnimatePresence mode="wait">
                {activeTab === 'signup' ? (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CreateAccountForm
                      onSuccess={handleSuccess}
                      onSwitchToSignIn={() => setActiveTab('signin')}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SignInForm
                      onSuccess={handleSuccess}
                      onSwitchToSignUp={() => setActiveTab('signup')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground text-center">
                By continuing, you agree to our{' '}
                <Link to="/terms-of-service" onClick={onClose} className="underline hover:text-foreground">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" onClick={onClose} className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
