import { useState, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/layout/navbar";
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

async function fetchClerkKey(): Promise<string> {
  const res = await fetch("/api/config");
  if (!res.ok) throw new Error("Failed to fetch config");
  const data = await res.json();
  return data.clerkPublishableKey;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

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

function Router() {
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
    </div>
  );
}

function App() {
  const [, setLocation] = useLocation();
  const [clerkPubKey, setClerkPubKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClerkKey()
      .then(setClerkPubKey)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <div>Failed to load config: {error}</div>;
  }

  if (!clerkPubKey) {
    return <div>Loading...</div>;
  }

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
            <ClerkQueryClientCacheInvalidator />
            <Router />
          </ClerkProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
