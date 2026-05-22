import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, User, MapPin, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.15, ease: 'easeOut' as const }
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95,
    transition: { duration: 0.1, ease: 'easeIn' as const }
  },
};

export default function AccountDropdown({ isOpen, onClose }: AccountDropdownProps) {
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/account/orders' },
    { icon: User, label: 'Profile', href: '/account/profile' },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: Heart, label: 'Favorites', href: '/account/favorites' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to catch clicks */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          <motion.div
            className="absolute right-0 top-full mt-2 w-56 bg-background border border-border shadow-xl z-50"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Greeting */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm text-foreground font-medium">Hi, {firstName}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <item.icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-border py-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
