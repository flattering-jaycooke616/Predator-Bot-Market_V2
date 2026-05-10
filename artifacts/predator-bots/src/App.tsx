import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Bots from "@/pages/bots";
import BotDetail from "@/pages/bot-detail";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkPubKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_aW50ZW50LWN1Yi0xOC5jbGVyay5hY2NvdW50cy5kZXYk";

const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://harmless-gazelle-457.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function AppContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [, setLocation] = useLocation();
  const [convexReady, setConvexReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        convex.setAuth(async () => getToken({ template: "convex" }));
      } else {
        convex.clearAuth();
      }
      setConvexReady(true);
    }
  }, [isLoaded, isSignedIn, getToken]);

  if (!convexReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/bots" component={Bots} />
          <Route path="/bots/:id" component={BotDetail} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={Admin} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const [, setLocation] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProvider
            publishableKey={clerkPubKey}
            signInUrl={`${basePath}/sign-in`}
            signUpUrl={`${basePath}/sign-up`}
            routerPush={(to) => setLocation(stripBase(to))}
            routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
            appearance={{
              variables: {
                colorPrimary: "hsl(144, 100%, 45%)",
                colorBackground: "hsl(240, 10%, 6%)",
                colorInputBackground: "hsl(240, 10%, 12%)",
                colorInputText: "hsl(0, 0%, 98%)",
                colorText: "hsl(0, 0%, 98%)",
              }
            }}
          >
            <ConvexProvider client={convex}>
              <AppContent />
            </ConvexProvider>
          </ClerkProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
