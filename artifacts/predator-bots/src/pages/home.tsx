import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Activity, ShieldAlert, BarChart3, TerminalSquare, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 text-center lg:text-left space-y-8">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                Execute Trades with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Lethal Precision.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-light">
                Premium MetaTrader 4 expert advisors built for institutional-grade performance. Stop guessing. Start executing.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/bots">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-mono uppercase tracking-wider text-base neon-glow">
                    Browse Arsenal <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-white/10 hover:bg-white/5 font-mono uppercase tracking-wider text-base text-white">
                    Create Account
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-white/5 mt-8">
                <div>
                  <div className="text-3xl font-mono font-bold text-white">24/7</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Market Execution</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div>
                  <div className="text-3xl font-mono font-bold text-white">99.9%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Uptime Target</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div>
                  <div className="text-3xl font-mono font-bold text-white">&lt;5ms</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Latency</div>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square">
                {/* Decorative background circle */}
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                
                {/* Images */}
                <img 
                  src="/hero-laptop.png" 
                  alt="Laptop running Predator Bot on MT4" 
                  className="absolute right-0 bottom-10 w-[80%] rounded-xl shadow-2xl border border-white/10 z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
                <img 
                  src="/hero-phone.png" 
                  alt="Phone running Predator Bot on MT4" 
                  className="absolute left-0 bottom-0 w-[40%] rounded-[2rem] shadow-2xl border border-white/10 z-20 transform rotate-6 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Engineered for Alpha</h2>
            <p className="text-muted-foreground text-lg">Our MQ4 bots are compiled with proprietary logic designed to identify market inefficiencies and execute before human reaction time allows.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <TerminalSquare className="h-8 w-8 text-primary" />,
                title: "Institutional Logic",
                description: "Built using the same quantitative models utilized by prop desks and hedge funds."
              },
              {
                icon: <ShieldAlert className="h-8 w-8 text-primary" />,
                title: "Dynamic Risk Control",
                description: "Hard-coded stop losses, equity protection mechanisms, and dynamic lot sizing."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-primary" />,
                title: "Backtested Robustness",
                description: "Years of tick-data backtesting ensure survival across diverse market conditions."
              }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-xl hover:-translate-y-1 transition-all duration-300">
                <div className="bg-background w-16 h-16 rounded-lg flex items-center justify-center mb-6 border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Deploy in Minutes.</h2>
              <p className="text-muted-foreground text-lg">We've eliminated the complexity of algorithmic trading. Download, attach to chart, and monitor.</p>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "Select Your Weapon", desc: "Browse our marketplace to find an EA that matches your risk profile and traded instruments." },
                  { step: "02", title: "Secure Download", desc: "Purchase securely and instantly download the compiled .ex4 file directly from your dashboard." },
                  { step: "03", title: "Attach & Activate", desc: "Load it into your MT4 terminal, adjust the presets if desired, and enable AutoTrading." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="font-mono text-2xl font-bold text-primary opacity-50">{item.step}</div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full bg-card border border-white/5 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="font-mono text-sm text-primary mb-6 flex items-center gap-2">
                <TerminalSquare className="h-4 w-4" /> terminal.log
              </div>
              <div className="space-y-3 font-mono text-xs md:text-sm">
                <div className="text-muted-foreground">Initializing Predator_Core.ex4...</div>
                <div className="text-muted-foreground">Authenticating license key... <span className="text-primary">OK</span></div>
                <div className="text-muted-foreground">Connecting to price feed... <span className="text-primary">OK</span></div>
                <div className="text-muted-foreground">Loading historical cache... <span className="text-primary">OK</span></div>
                <div className="text-white mt-4 border-l-2 border-primary pl-3 py-1">
                  System Armed. Awaiting signals.
                </div>
                <div className="text-muted-foreground mt-4">Scanning XAUUSD M15...</div>
                <div className="text-emerald-400 mt-2">→ BUY Signal Detected @ 2024.15</div>
                <div className="text-emerald-400">→ Order #4928174 Executed. SL: 2019.50 TP: 2035.00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-white mb-12">System Intel</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="text-left font-mono hover:text-primary hover:no-underline">Which platforms are supported?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                All our expert advisors are compiled exclusively for MetaTrader 4 (MT4). We do not currently support MetaTrader 5 (MT5) or cTrader.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="text-left font-mono hover:text-primary hover:no-underline">Are settings customizable?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Every bot comes with exposed inputs for lot sizing, risk percentage, maximum spread, and trading hours. Core logic parameters remain protected.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="text-left font-mono hover:text-primary hover:no-underline">How are files delivered?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                After successful payment, the compiled .ex4 file becomes immediately available in your Dashboard. You are granted up to 2 downloads per purchase for security purposes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-white/10">
              <AccordionTrigger className="text-left font-mono hover:text-primary hover:no-underline">Do I need a VPS?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                While not strictly required, a Virtual Private Server (VPS) is highly recommended to ensure the bot runs 24/7 without interruption and with minimal latency to your broker's servers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      <footer className="py-12 border-t border-white/5 text-center text-muted-foreground text-sm font-mono">
        <p>© {new Date().getFullYear()} Predator Bots. All rights reserved.</p>
        <p className="mt-2 text-xs opacity-50 max-w-2xl mx-auto">Trading foreign exchange on margin carries a high level of risk. Past performance is not indicative of future results.</p>
      </footer>
    </div>
  );
}
