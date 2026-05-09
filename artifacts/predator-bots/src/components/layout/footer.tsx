import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Predator Bots. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs mt-1 opacity-50 max-w-2xl">
              Trading foreign exchange on margin carries a high level of risk. Past performance is not indicative of future results.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Designed & Built by</span>
            <a
              href="https://letsoperate.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Letsoperate
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
