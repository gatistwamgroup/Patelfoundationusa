import { Suspense, lazy, useState, useEffect } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import Index from "./pages/Index";
import SocialSidebar from "./components/SocialSidebar";
import ScrollToTop from "./components/ScrollToTop";
import GlobalEffects from "./components/GlobalEffects";
import ImpactHeartbeat from "./components/ImpactHeartbeat";
import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import FloatingDonate from "./components/FloatingDonate";

// Lazy Load Pages for better performance
const About = lazy(() => import("./pages/About"));
const Programs = lazy(() => import("./pages/Programs"));
const Stories = lazy(() => import("./pages/Stories"));
const GetInvolved = lazy(() => import("./pages/GetInvolved"));
const Donate = lazy(() => import("./pages/Donate"));
const Contact = lazy(() => import("./pages/Contact"));
const StoryDetail = lazy(() => import("./pages/StoryDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Success = lazy(() => import("./pages/Success"));
const Cancel = lazy(() => import("./pages/Cancel"));
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Minimal fallback for lazy loaded pages
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
);

// Root Layout to wrap routes and provide global elements
const RootLayout = () => {
  return (
    <>
      <div className="grain-overlay" />
      <GlobalEffects />
      <ImpactHeartbeat />
      <SmoothScroll />
      <ScrollToTop />
      <FloatingDonate />
      <SocialSidebar />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "about", element: <About /> },
      { path: "programs", element: <Programs /> },
      { path: "stories", element: <Stories /> },
      { path: "stories/:id", element: <StoryDetail /> },
      { path: "get-involved", element: <GetInvolved /> },
      { path: "gallery", element: <Gallery /> },
      { path: "donate", element: <Donate /> },
      { path: "success", element: <Success /> },
      { path: "cancel", element: <Cancel /> },
      { path: "contact", element: <Contact /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  // Admin routes — outside RootLayout (no social widgets, no grain overlay)
  {
    path: "/admin",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProtectedRoute><AdminDashboard /></ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: "/admin/login",
    element: <Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>,
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }
});

const App = () => {
  const [isLoading, setIsLoading] = useState(() => {
    const hasShown = sessionStorage.getItem('hasShownPreloader');
    return !hasShown;
  });

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      sessionStorage.setItem('hasShownPreloader', 'true');
    }
  }, [isLoading]);

  return (
    <PayPalScriptProvider
      options={{
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "sb",
        currency: "USD",
        intent: "capture",
        vault: false,
        "data-sdk-integration-source": "button-factory",
        "integration-date": "2023-06-15",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <AuthProvider>
            <RouterProvider router={router} future={{ v7_startTransition: true }} />
          </AuthProvider>

          <AnimatePresence>
            {isLoading && (
              <Preloader key="preloader" onComplete={() => setIsLoading(false)} />
            )}
          </AnimatePresence>
        </TooltipProvider>
      </QueryClientProvider>
    </PayPalScriptProvider>
  );
};

export default App;


