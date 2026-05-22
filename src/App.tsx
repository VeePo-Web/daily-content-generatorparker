import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SizeQuizProvider } from "@/contexts/SizeQuizContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { StripeProvider } from "@/components/checkout/StripeProvider";
import { migrateLocalStorage } from "@/lib/storageMigration";

// Run localStorage migration on app load (before React renders)
migrateLocalStorage();
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/motion/PageTransition";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import OpsPortalGate from "./components/admin/OpsPortalGate";
import ProtectedAccountRoute from "./components/account/ProtectedAccountRoute";

// Lazy-loaded pages — each becomes its own chunk
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const Category = lazy(() => import("./pages/Category"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OurStory = lazy(() => import("./pages/about/OurStory"));
const OurMission = lazy(() => import("./pages/about/OurMission"));
const SizeGuide = lazy(() => import("./pages/about/SizeGuide"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Community = lazy(() => import("./pages/Community"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ReturnsExchanges = lazy(() => import("./pages/ReturnsExchanges"));
const ShippingInfo = lazy(() => import("./pages/ShippingInfo"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const TryOnRoom = lazy(() => import("./pages/TryOnRoom"));
const Ambassador = lazy(() => import("./pages/Ambassador"));
const RecoverCart = lazy(() => import("./pages/RecoverCart"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const Catalogue = lazy(() => import("./pages/Catalogue"));
const AdminLookbook = lazy(() => import("./pages/admin/AdminLookbook"));
const AdminLookbookForm = lazy(() => import("./pages/admin/AdminLookbookForm"));
const AccountLayout = lazy(() => import("./pages/account/AccountLayout"));
const AccountDashboard = lazy(() => import("./pages/account/AccountDashboard"));
const AccountOrders = lazy(() => import("./pages/account/AccountOrders"));
const AccountOrderDetail = lazy(() => import("./pages/account/AccountOrderDetail"));
const AccountProfile = lazy(() => import("./pages/account/AccountProfile"));
const AccountAddresses = lazy(() => import("./pages/account/AccountAddresses"));
const AccountFavorites = lazy(() => import("./pages/account/AccountFavorites"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Animated Routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="popLayout">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/category/:category" element={<PageTransition><Category /></PageTransition>} />
        <Route path="/product/:productId" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
        <Route path="/about/our-story" element={<PageTransition><OurStory /></PageTransition>} />
        <Route path="/about/our-mission" element={<PageTransition><OurMission /></PageTransition>} />
        <Route path="/about/size-guide" element={<PageTransition><SizeGuide /></PageTransition>} />
        <Route path="/about/customer-care" element={<Navigate to="/contact" replace />} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/returns" element={<PageTransition><ReturnsExchanges /></PageTransition>} />
        <Route path="/shipping" element={<PageTransition><ShippingInfo /></PageTransition>} />
        <Route path="/accessibility" element={<PageTransition><Accessibility /></PageTransition>} />
        <Route path="/catalogue" element={<PageTransition><Catalogue /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
        <Route path="/try-on" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/try-on/saved/:outfitId" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/ambassador" element={<PageTransition><Ambassador /></PageTransition>} />
        <Route path="/recover-cart" element={<PageTransition><RecoverCart /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        {/* Account Routes */}
        <Route path="/account" element={<ProtectedAccountRoute><PageTransition><AccountLayout /></PageTransition></ProtectedAccountRoute>}>
          <Route index element={<AccountDashboard />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:orderId" element={<AccountOrderDetail />} />
          <Route path="favorites" element={<AccountFavorites />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="addresses" element={<AccountAddresses />} />
        </Route>
        {/* Admin Routes — obscured path, gated by shared passphrase */}
        <Route path="/ops-portal/login" element={<OpsPortalGate><PageTransition><AdminLogin /></PageTransition></OpsPortalGate>} />
        <Route path="/ops-portal" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProducts /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products/new" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProductForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products/:productId/edit" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProductForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/categories" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminCategories /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/discounts" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminDiscounts /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbook /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook/new" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbookForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook/:lookId/edit" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbookForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/orders" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminOrders /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/orders/:orderId" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminOrderDetail /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <RecentlyViewedProvider>
          <SizeQuizProvider>
            <StripeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <AnimatedRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </StripeProvider>
          </SizeQuizProvider>
        </RecentlyViewedProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
