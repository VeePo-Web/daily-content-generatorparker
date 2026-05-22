import { ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, User, MapPin, LayoutDashboard, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import Layout from '@/components/layout/Layout';
import { cn } from '@/lib/utils';

const sidebarLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/account' },
  { icon: Package, label: 'Orders', href: '/account/orders' },
  { icon: Heart, label: 'Favorites', href: '/account/favorites' },
  { icon: User, label: 'Profile', href: '/account/profile' },
  { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
];

export default function AccountLayout() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const isActive = (href: string) => {
    if (href === '/account') {
      return location.pathname === '/account';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Mobile tabs with scroll indicators */}
          <div className="lg:hidden mb-8 relative">
            {/* Scroll fade indicators */}
            <div className="absolute left-0 top-0 bottom-2 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0" />
            <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex gap-2 min-w-max pb-3 border-b border-border">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      'px-4 py-2.5 text-sm whitespace-nowrap transition-colors rounded-sm flex items-center gap-2',
                      isActive(link.href)
                        ? 'bg-foreground text-background'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <link.icon size={16} strokeWidth={1.5} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-32">
                {/* Welcome */}
                <div className="mb-8">
                  <h2 className="text-xl font-light text-foreground">
                    Hi, {firstName}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your account
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-sm',
                        isActive(link.href)
                          ? 'bg-foreground text-background'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <link.icon size={18} strokeWidth={1.5} />
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Sign out */}
                <div className="mt-8 pt-8 border-t border-border">
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full rounded-sm hover:bg-muted/50"
                  >
                    <LogOut size={18} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
