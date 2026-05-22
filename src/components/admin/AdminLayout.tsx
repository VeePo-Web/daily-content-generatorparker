import { ReactNode, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  LogOut,
  ChevronRight,
  Percent,
  Images,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

const navItems = [
  { href: '/ops-portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ops-portal/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/ops-portal/products', label: 'Products', icon: Package },
  { href: '/ops-portal/categories', label: 'Categories', icon: Tags },
  { href: '/ops-portal/lookbook', label: 'Lookbook', icon: Images },
  { href: '/ops-portal/discounts', label: 'Discounts', icon: Percent },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/ops-portal/login');
  }, [signOut, navigate]);

  // Session timeout: auto-logout after 30 min of inactivity
  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleSignOut, SESSION_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [handleSignOut]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium tracking-wider text-foreground">
            LOJ
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Operations</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-xs uppercase tracking-wider"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 min-h-[calc(100vh-3.5rem)] border-r border-border bg-card hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href ||
                (item.href !== '/ops-portal' && location.pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/ops-portal' && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
