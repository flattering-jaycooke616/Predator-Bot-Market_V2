import { Link, useLocation } from "wouter";
import { useAuth, useUser, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Activity, ShieldAlert, BarChart3, TerminalSquare, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./logo";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === 'admin';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bots", label: "Marketplace" },
    ...(isSignedIn ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="text-primary">
            <Logo className="h-7 w-7" />
          </div>
          <span className="font-mono font-bold tracking-tight text-lg text-white">
            PREDATOR<span className="text-primary">BOTS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${location === link.href ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-md border border-white/10" } }} />
          ) : (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-white" onClick={() => setLocation("/sign-in")}>
                Sign In
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,255,102,0.3)] font-mono uppercase tracking-wider" onClick={() => setLocation("/sign-up")}>
                Get Access
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-background p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium px-4 py-2 rounded-md ${location === link.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-2" />
          {isSignedIn ? (
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-sm font-medium text-white">{user?.emailAddresses[0]?.emailAddress}</span>
              <UserButton />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => { setLocation("/sign-in"); setMobileMenuOpen(false); }}>
                Sign In
              </Button>
              <Button className="w-full justify-start bg-primary text-primary-foreground font-mono" onClick={() => { setLocation("/sign-up"); setMobileMenuOpen(false); }}>
                Get Access
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
